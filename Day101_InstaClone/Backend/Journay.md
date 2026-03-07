# Development Journey

## Day 1: User Authentication

### Implemented Features:
- User registration and login functionality with layered architecture.

### LinkedIn Post Description:
Day 101 of Cohort 2.0 at Sheryians Coding School: We started building an Instagram clone using the MERN stack. Today, I implemented user registration and login functionality. Thanks to our mentor, Ankur Bhaiya, for explaining the importance of clean code and layered architecture for production-level codebases.

#### Tools & Libraries Practiced:
- Express
- MongoDB
- JSON Web Token (JWT)
- Cookie-Parser
- CORS
- dotenv
- Nodemon
- Morgan

---

## Day 2: Post Creation

### Implemented Features:
- Post creation functionality with multer middleware for image uploads and integration with ImageKit for storage.
- Layered architecture: Routes, Controllers, Services, Repository.

### LinkedIn Post Description:
Day 102 of Cohort 2.0 at Sheryians Coding School: Implemented post creation functionality with proper layering. Thanks to our mentor, Ankur Bhaiya, for encouraging us to read documentation to become better developers.

---

## Day 3: Authenticated Post Creation

### Implemented Features:
- Post creation with authentication using JWT stored in browser cookies.
- Middleware (`isAuthenticated`) to verify JWT and attach user info to requests.
- Introduced `ApiError` for cleaner error handling.
- Added a global error handler to standardize error responses.
- Introduced `asyncHandler` to streamline error handling in async functions.

### LinkedIn Post Description:
Day 103 of Cohort 2.0 at Sheryians Coding School: Implemented post creation with authentication. Learned about the importance of image optimization (e.g., WebP) and how ImageKit handles it seamlessly. Thanks to our mentor, Ankur Bhaiya, for explaining these concepts and pushing us to write scalable code.

---

## Day 4: Full Post CRUD + Like/Unlike

### Implemented Features:
- Full CRUD (Create, Read, Update, Delete) for posts.
- Like/Unlike toggle functionality.
- Layered architecture: Routes, Controllers, Services, Repository.
- Public and protected routes divided using `router.use(isAuthenticated)`.
- Atomic MongoDB operations (`$addToSet`, `$pull`, `$inc`) for like toggling.

### LinkedIn Post Description:
Day 104 of Cohort 2.0 at Sheryians Coding School: Implemented full Post CRUD and Like/Unlike functionality. Thanks to our mentor, Ankur Bhaiya, for emphasizing clean, production-level architecture.

#### Routes Added:
| Method | Path          | Access | Description                       |
|--------|---------------|--------|-----------------------------------|
| GET    | /             | Public | Paginated feed of all posts       |
| GET    | /:postId      | Public | Single post details               |
| POST   | /             | Auth   | Create post (with optional image) |
| GET    | /my/posts     | Auth   | Logged-in user's own posts        |
| PUT    | /:postId      | Auth   | Update caption/image (owner only) |
| DELETE | /:postId      | Auth   | Delete post (owner only)          |
| POST   | /:postId/like | Auth   | Toggle like/unlike                |

---

## Day 5: Followers System Design

### Implemented Features:
- Designed a scalable followers system using a separate `Follow` collection.
- Removed `followers` and `followings` arrays from the `User` model to avoid hitting MongoDB's 16MB document size limit.
- Created an edge collection `Follow` with the following schema:
  ```json
  {
    "_id": ObjectId,
    "follower": ObjectId,
    "following": ObjectId,
    "createdAt": Date
  }
  ```

### LinkedIn Post Description:
Day 105 of Cohort 2.0 at Sheryians Coding School: Designed a scalable followers system. Learned why storing followers in a separate collection is better than embedding them in the user document. Thanks to our mentor, Ankur Bhaiya, for explaining these concepts.

---

## Day 6: Follow/Unfollow + Like/Unlike Refactor + Follow Request Status

### Implemented Features:
- Follow/Unfollow functionality.
- Implemented **Follow Request Status** ("pending", "active", "rejected", "blocked"). Follow requests default to "pending" upon creation.
- Added endpoints to accept/reject/block follow requests, and to fetch all pending requests.
- Refactored `Follow` model to use `String` fields for `follower` and `following` (future-proofing for user IDs) and added the `status` enum.
- Created a `Like` collection for scalability, removing `likes` and `comments` arrays from the `Post` model.
- `Like` schema:
  ```json
  {
    "post": ObjectId,
    "likedBy": ObjectId,
    "createdAt": Date
  }
  ```

### LinkedIn Post Description:
Day 106 of Cohort 2.0 at Sheryians Coding School: Implemented Follow/Unfollow and Like/Unlike functionality with scalable design. Also added a robust status management system for followers ("pending", "active", "rejected", "blocked") to handle user privacy effectively. Thanks to our mentor, Ankur Bhaiya, for guiding us through these changes and emphasizing scalability.

---
