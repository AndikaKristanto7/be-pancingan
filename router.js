var app = require("@forkjs/group-router");
const DB = require('./services/db.js');
const jwt = require('jsonwebtoken')

// JWT
const secretKey = process.env.SECRET;

// app.get('/', (req, res) => {
//     res.json({ message: 'Protected data' });
//   });


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
                                .whereRaw('deleted_at IS NULL')
                                .where('is_published','Y')
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
        let body = req.body
        const {title, slug, location, image, email, description} = body
        try{
            let findExistingBlogBySlug = await DB.from('blogs').select("id").where({slug:body.slug}).first();
            if(typeof findExistingBlogBySlug == "object"){
                throw {msg:'Slug existed!',status:400}
            }
            let blog = await DB('blogs').insert({
                title,
                slug,
                location,
                image,
                description
            }).returning(['id'])
            return res.json(
                {
                    code:200,
                    message:'ok',
                    data:
                    {
                        id : blog[0].id,
                        title,
                        slug,
                        location,
                        image,
                        description
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

    app.get("/blog/:slug", async (req,res)=>{
        let slug = req.params.slug
        try{
            const blog = await DB.from('blogs')
                                .join('users','blogs.user_id','users.id')
                                .select(['slug','title','description','location','image','blogs.created_at','email','role'])
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
        const {title, slug, location, image, email, description} = body
        try{
            await DB.from('blogs').where({slug:req.params.slug}).update({title,slug,location,image,description});       
            return res.json({code:200,message:'ok',data:{slug:req.params.slug,title, location, image, description}}).status(200)
        }catch(e){
            return res.json({code:500,message:e.message,data:null}).status(500)
        }
    })
    
    app.delete("/blog/:slug", async (req,res)=>{
        try{
            await DB.from('blogs').where({slug:req.params.slug}).update({'deleted_at':new Date().toISOString()})
            return res.json({code:200,message:`Data blog dengan slug ${req.params.slug} berhasil di delete`}).status(200)
        }catch(e){
            return res.json({message:e.message}).status(500)
        }
        
    })
    //API LOGIN
    app.post("/login", authenticateToken, async (req,res)=>{
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
            const token =jwt.sign({email:res.email}, secretKey, {expiresIn: "30m"});
            return res.json(
                {
                    code:200,
                    message:'ok',
                    data:
                    {
                        ...body,
                        role: 'user',
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
    function authenticateToken(req, res, next) {
        try {
            const decoded = jwt.verify(token, secretKey);  
            req.user = decoded;
            next(); 
        } catch(err) {
            console.log('JWT verification failed', err);
            res.send(err)
        } 
      }
})

module.exports = app.router;
