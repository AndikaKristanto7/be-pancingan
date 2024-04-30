var app = require("@forkjs/group-router");
const DB = require('./services/db.js');
const jwt = require('jsonwebtoken')

// JWT
const secretKey = process.env.SECRET;

app.group("/api/v1",() =>{
    async function getPublishedBlogs(offset,pageSize){
        let data = await DB.from('blogs')
                                .select(['title','slug','description','image','id'])
                                .orderBy('id','desc')
                                .whereRaw('deleted_at IS NULL')
                                .where('is_published','Y')
                                .offset(offset)
                                .limit(pageSize);

        const totalCount = await DB.from('blogs')
                                    .count('* as total')
                                    .whereRaw('deleted_at IS NULL')
                                    .where('is_published','Y')
                                    .first();
        return {data,totalCount}
    }

    async function getUnpublishedBlogs(offset,pageSize){
        let data = await DB.from('blogs')
                .select(['title','slug','description','image','id'])
                .orderBy('id','desc')
                .whereRaw('deleted_at IS NULL')
                .where('is_published','N')
                .offset(offset)
                .limit(pageSize);

        const totalCount = await DB.from('blogs')
                    .count('* as total')
                    .whereRaw('deleted_at IS NULL')
                    .where('is_published','N')
                    .first();
        return {data,totalCount}
    }

    async function getBlogsByEmail(email,offset,pageSize){
        let data = await DB.from('blogs')
                .join('users','blogs.user_id','users.id')
                .select(['title','slug','description','image','blogs.id'])
                .orderBy('blogs.id','desc')
                .where('email',email)
                .offset(offset)
                .limit(pageSize);

        const totalCount = await DB.from('blogs')
                    .join('users','blogs.user_id','users.id')
                    .where('email',email)
                    .count("* as total")
                    .first();
        return {data,totalCount}
    }

    app.get("/blogs", async (req,res)=>{
        try{
            // Pagination parameters
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;
            const unpublished = req.query.unpublished ?? false
            const email = req.query.email ?? false
            let result
            let data;
            let totalCount
            // Get paginated list of blogs
            if(email){
                result = await getBlogsByEmail(email,offset, pageSize)
            }else if(unpublished){
                result = await getUnpublishedBlogs(offset,pageSize)
            }else{
                result = await getPublishedBlogs(offset,pageSize)
            }
            data = result.data
            totalCount = result.totalCount
            let resp = {
                code:200,
                message:'ok',
                data,
                pagination: {
                    page,
                    pageSize,
                    total: parseInt(totalCount.total),
                    totalPages: Math.ceil(parseInt(totalCount.total) / pageSize)
                }
            }
            return res.json(resp).status(200);
        } catch(e) {
            console.log(e)
            let resp = {
                code:500,
                //message:e.getMessage(),
                data:null
            }
            return res.json(resp).status(500);
        }
        
        
    })
    
    app.post("/blog", async (req,res)=>{
        let body = req.body;
        
        // Validasi input
        const { title, slug, location, image, description } = body;
    try {
        // Validasi input
        if (!title || !slug || !description || !image) {
            throw {msg: 'All fields are required', status: 400};
        }

        // Periksa apakah pengguna dengan alamat email tersebut ada
        const user = await DB.from('users').select("id").where({email:req.user.email}).first();
        if (!user) {
            throw {msg: 'User with that email not found', status: 403};
        }

        // Periksa apakah slug sudah ada dalam database
        const existingBlog = await DB.from('blogs').select("id").where({slug}).first();
        if(existingBlog) {
            throw {msg:'Slug already exists!', status: 400};
        }

        // Buat blog baru dengan slug yang unik dan user_id yang sesuai
        const newBlog = await DB('blogs').insert({
            title,
            slug,
            location,
            image,
            description,
            user_id: user.id
        }).returning(['id']);

        return res.status(201).json({
            code: 201,
            message: 'Blog successfully created',
            data: {
                id: newBlog[0].id,
                title,
                slug,
                location,
                image,
                description
            },
            location: `/api/v1/blog/${slug}`
        });
    } catch(e) {
        return res.status(e.status || 500).json({
            code: e.status || 500,
            message: e.msg || e.message,
            data: null
        });
    }
});

    app.get("/blog/:slug", async (req,res)=>{
        let slug = req.params.slug
        try{
            const blog = await DB.from('blogs')
                                .join('users','blogs.user_id','users.id')
                                .select(['slug','title','description','location','image','blogs.created_at','email','role','is_published'])
                                .where({slug:slug})
                                .first()
            if (!blog) {
                return res.status(404).json({code:404,message:`Blog dengan slug ${slug} tidak ditemukan`,data:null})
            }
            return res.json({code:200,message:'ok',data:blog}).status(200)
        } catch(e) {
            return res.json({code:500,message:e.message,data:null}).status(500)
        }
    })
    
    app.put("/blog/:slug", async (req,res)=>{
        let body = req.body;
        const {title, slug, location, image, description} = body
        const user = await DB.from('users').select("id").where({email:req.user.email}).first();
        if (!user) {
            throw {msg: 'User with that email not found', status: 403};
        }
        try{
            await DB.from('blogs').where({slug:req.params.slug}).update({title,slug,location,image,description,is_published:'N'});       
            return res.json({code:200,message:'ok',data:{slug:req.params.slug,title, location, image, description}}).status(200)
        }catch(e){
            return res.json({code:500,message:e.message,data:null}).status(500)
        }
    })

    app.put("/blog/publish/:slug", async (req,res)=>{
        let body = req.body;
        const user = await DB.from('users').select("id").where({email:req.user.email}).first();
        if (!user) {
            throw {msg: 'User with that email not found', status: 403};
        }
        try{
            await DB.from('blogs').where({slug:req.params.slug}).update('is_published','Y');       
            return res.json({code:200,message:`Blog with slug : ${req.params.slug} published!`}).status(200)
        }catch(e){
            return res.json({code:500,message:e.message,data:null}).status(500)
        }
    })
    
    app.delete("/blog/:slug", async (req,res)=>{
        const user = await DB.from('users').select("id").where({email:req.user.email}).first();
        if (!user) {
            throw {msg: 'User with that email not found', status: 403};
        }
        try{
            await DB.from('blogs').where({slug:req.params.slug}).update({'deleted_at':new Date().toISOString()})
            return res.json({code:200,message:`Data blog dengan slug ${req.params.slug} berhasil di delete`}).status(200)
        }catch(e){
            return res.json({message:e.message}).status(500)
        }
        
    })
    //API LOGIN
    app.post("/login", async (req,res)=>{
        let body = req.body
        
        try{
            let role;
            let user = await DB.from('users').select("role").where({email:body.email}).first();
            if(typeof user !== "object"){
                user = await DB('users').insert({...body,role:'user'})
                role = "user";                
            }else{
                role = user.role
            }
            const token =jwt.sign({email:req.body.email}, secretKey, {expiresIn: 30 * 1000 * 60 });
            return res.json(
                {
                    code:200,
                    message:'ok',
                    data:
                    {
                        ...body,
                        role,
                        token
                    },
                }).status(200)
        }catch(e){
            return res.status(e.status || 500).json(
                {
                    code:e.status || 500,
                    message:e.msg || e.message,
                    data: null,
                })
        }

    })
})

module.exports = app.router;
