var app = require("@forkjs/group-router");
const DB = require('./services/db.js');

app.group("/api/v1",() =>{
    app.get("/blogs", async (req,res)=>{
        try{
            let data = await DB.from('blog').select(['title','slug','description','image']).orderBy('id','desc');
            let resp = {code:200,message:'ok',data}
            return res.json(resp).status(200);
        }catch(e){
            let resp = {code:500,message:e.getMessage(),data:null}
            return res.json(resp).status(500);
        }
        
    })
    
    app.post("/blog", async (req,res)=>{
        let body = req.body
        try{
            let findExistingBlogBySlug = await DB.from('blog').select("id").where({slug:body.slug}).first();
            if(typeof findExistingBlogBySlug == "object"){
                throw {msg:'Slug existed!',status:400}
            }
            let blog = await DB('blog').insert(body).returning(['id'])
            return res.json(
                {
                    code:200,
                    message:'ok',
                    data:
                    {
                        id : blog[0].id,
                        ...body
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
            const blog = await DB.from('blog').select("*").where({slug:slug}).first()
            return res.json({code:200,message:'ok',data:blog}).status(200)
        }catch(e){
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

// Get all blogs with image and created_at
app.get("/blogs_with_image", async (req, res) => {
  try {
      let data = await DB.from('blogs').select(['id', 'title', 'slug', 'description', 'image', 'created_at']).orderBy('id', 'desc');
      let resp = { code: 200, message: 'ok', data };
      return res.json(resp).status(200);
  } catch (e) {
      let resp = { code: 500, message: e.message, data: null };
      return res.json(resp).status(500);
  }
});

// Create a new blog with image and created_at
app.post("/blog_with_image", async (req, res) => {
  let body = req.body;
  try {
      let findExistingBlogBySlug = await DB.from('blogs').select("id").where({ slug: body.slug }).first();
      if (findExistingBlogBySlug) {
          throw { msg: 'Slug existed!', status: 400 };
      }

      // Inserting blog data with image and created_at
      body.created_at = new Date(); // Set created_at timestamp
      let insertedBlog = await DB('blogs').insert(body).returning('*');

      return res.json({
          code: 200,
          message: 'ok',
          data: insertedBlog[0],
      }).status(200);
  } catch (e) {
      return res.status(e.status || 500).json({
          code: e.status || 500,
          message: e.msg || e.message,
          data: null,
      });
  }
});

// Get blog by slug with image and created_at
app.get("/blog_with_image/:slug", async (req, res) => {
  let slug = req.params.slug;
  try {
      const blog = await DB.from('blogs').select("*").where({ slug }).first();
      return res.json({ code: 200, message: 'ok', data: blog }).status(200);
  } catch (e) {
      return res.json({ code: 500, message: e.message, data: null }).status(500);
  }
});

// Update blog by slug with image and created_at
app.put("/blog_with_image/:slug", async (req, res) => {
  let body = req.body;
  try {
      body.created_at = new Date(); // Update created_at timestamp
      await DB.from('blogs').where({ slug: req.params.slug }).update(body);
      const updatedBlog = await DB.from('blogs').select("*").where({ slug: req.params.slug }).first();
      return res.json({ code: 200, message: 'ok', data: updatedBlog }).status(200);
  } catch (e) {
      return res.json({ code: 500, message: e.message, data: null }).status(500);
  }
});

// Delete blog by slug with image and created_at
app.delete("/blog_with_image/:slug", async (req, res) => {
  try {
      await DB.from('blogs').where({ slug: req.params.slug }).delete();
      return res.json({ code: 200, message: `Blog with slug ${req.params.slug} deleted successfully` }).status(200);
  } catch (e) {
      return res.json({ code: 500, message: e.message }).status(500);
  }
});

module.exports = app.router;
