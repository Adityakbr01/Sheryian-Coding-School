async function alreadyLikedPost(post) {
   return post.likes.some(
      (id) => id.toString() === userId.toString(),
    );
}



module.exports = alreadyLikedPost