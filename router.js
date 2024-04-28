var app = require("@forkjs/group-router");
const DB = require('./services/db.js');

app.group("/api/v1",() =>{
    app.get("/blogs", async (req,res)=>{
        try{
            // Pagination parameters
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            // Get paginated list of blogs
            let data = await DB.from('blogs')
                                .select(['title','slug','description','image','id'])
                                .orderBy('id','desc')
                                .offset(offset)
                                .limit(pageSize);
            
            // Get total count of blogs
            const totalCount = await DB.from('blogs').count('* as total').first();

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
        const { title, slug, location, image, email, description } = body;
    try {
        // Validasi input
        if (!title || !slug || !description || !image || !email) {
            throw {msg: 'All fields are required', status: 400};
        }

        // Periksa apakah pengguna dengan alamat email tersebut ada
        const user = await DB.from('users').select("id").where({email}).first();
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
    //     let slug = req.params.slug
    //     try{
    //         const blog = await DB.from('blog').select("*").where({slug:slug}).first()
    //         return res.json({code:200,message:'ok',data:blog}).status(200)
    //     }catch(e){
    //         return res.json({code:500,message:e.message,data:null}).status(500)
    //     }
        
    // })
    
        let slug = req.params.slug
        try{
            const blog = await DB.from('blogs').select("*").where({slug:slug}).first()
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
        try{
            await DB.from('blog').where({slug:req.params.slug}).update(body);       
            return res.json({code:200,message:'ok',data:{slug:req.params.slug,...body}}).status(200)
        }catch(e){
            return res.json({code:500,message:e.message,data:null}).status(500)
        }
    })
    
    app.delete("/blog/:slug", async (req,res)=>{
        try{
            await DB.from('blog').where({slug:req.params.slug}).delete()
            return res.json({code:200,message:`Data blog dengan slug ${req.params.slug} berhasil di delete`}).status(200)
        }catch(e){
            return res.json({message:e.message}).status(500)
        }
        
    })
})



module.exports = app.router;
