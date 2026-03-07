# DAY 1

## Implemnted register And login User functionality with Layer


### POST DESC FOR LINKDIN

- Day 101 of cohort 2.0 Sheryians coding school we starting a Insta clone Project with mern stack today i was build a Register and Login user,thanks to Our mentor ankur Bhaiya he explain clearly how and why clean code and layer base arctechture matter for Production level Codebase

#### Practice

      - Express
      - mongodb
      - jsonwebtoken
      - cookie-parser
      - cors
      - env
      - nodemon
      - morgan

# DAY 2

## Implelmenting Post creation with multer as middleware and image storage for image-kit with previews layers

- Routes
- Controllers
- Services
- Respository

  ### POST DESC FOR LINKDIN
  - DAY 102 of cohort 2.0 Sheryains coding school we implementing a post creation route,controller,service and all db assential funtion in repository and again thanks to Our mentor ankur Bhaiya he forcing to read documentation to become a best Developer




# DAY 3

## Implemnted Post Creation with Authenticated User, functionality with Layer

- Routes
- Controllers
- Services
- Respository
- middlewares {New}

### POST DESC FOR LINKDIN

- Day 103 of cohort 2.0 Sheryians coding school today Class all about Post creation with Authenticated user for authentication we use a JWT token which is store in client Browser cookies and my backend middleware(isAuthenticated) read cookies and extract jwt token and verify them and if verification failed he throw an error (Unauthorized) | | 401 and if verification success than he send a req.user and he contain info's (userId,email) after all these we create a post with who created post,caption,and PostImageUrl and Thanks to Our mentor Ankur bhaiay he explain all of these and one more thing he  explain why webp(image optimization required) why image comppression required every scalbel web app and Image kit do it behind the scene already

 - instroducing ApiError which help to siplified throw error insted of 
-  
`` 
const err = new Error("User not found");
err.status = 404;
throw err

``
we use this

``if (!user) {
  throw new ApiError(404, "User not found");
}
``

- introducing a global error handler to prevent a  sending 500 status and random message and prevent to stop my app working and he is clean gloabl error handler 

- introduce a asyncHandler which is handling error and send to global error handler





# DAY 4

## Implemented Full Post CRUD + Like/Unlike functionality with all Layers

- Routes
- Controllers
- Services
- Repository

### POST DESC FOR LINKDIN

- Day 104 of cohort 2.0 Sheryians coding school today class was all about implementing full Post CRUD (Create, Read, Update, Delete) and a like/unlike toggle feature across all layers (Router → Controller → Service → Repository). Routes are split into public (no auth) and protected (auth required) using a single `router.use(isAuthenticated)` divider. The service layer handles all business logic like ownership checks, pagination meta, and the like toggle, while the repository layer only talks to MongoDB using atomic operators like `$addToSet`, `$pull`, and `$inc` to keep `likeCount` in sync. Thanks to our mentor Ankur Bhaiya for pushing clean, production-level architecture.

#### Routes Added

| Method | Path          | Access | Description                       |
| ------ | ------------- | ------ | --------------------------------- |
| GET    | /             | Public | Paginated feed of all posts       |
| GET    | /:postId      | Public | Single post details               |
| POST   | /             | Auth   | Create post (with optional image) |
| GET    | /my/posts     | Auth   | Logged-in user's own posts        |
| PUT    | /:postId      | Auth   | Update caption/image (owner only) |
| DELETE | /:postId      | Auth   | Delete post (owner only)          |
| POST   | /:postId/like | Auth   | Toggle like / unlike              |






--------------------Layers-----------------

- Routes
- Controllers
- Services
- Respository
- - middlewares {New}


# DAY 5

## Implemented Followers functionality

### POST DESC FOR LINKDIN

- Day 104 of cohort 2.0 Sheryians coding school today class was all about implemnting a followers, and followings with scalable system design why not storing followers in user collection in followers array instead of creating a edge collection called follows and strong 
- {
_id,
follower,
following,
createdtedAt
- 
- }
becouse in mongodb only give 16mb to store a data in user>followers Array, i remove 

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],


in user.model and create a seprate collection called follow only implemneting a model not any routes.controller...