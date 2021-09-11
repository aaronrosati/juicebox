const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

//USER METHODS
const createUser = async ({ 
    username, 
    password,
    name, 
    location
    }) => {
    try {
        const { rows: [ user ] } = await client.query(`
            INSERT INTO users (username, password, name, location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, password, name, location]);

        return user;
    } catch(error) {
        throw error;
    };
};


const updateUser = async (id, fields = {} ) => {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ user ] } = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return user;
    } catch(error) {
        throw error;
    };
};

const getAllUsers = async () => {
    try {
        const { rows } = await client.query(
            `SELECT id, username, name, location, active
            FROM users;
        `);
    
        return rows;
    } catch(error) {
        console.error(error);
    };
};

const getUserById = async (userId) => {
    try {
        let { rows: [user] } = await client.query(`
            SELECT * FROM users
            WHERE id = $1
        `, [userId]);

        if (!user) { 
            return null
        }

        if (user) {
            delete user['password']
        }

        user.posts = await getPostsByUser(userId);

        return user;
    } catch(error) {
        console.error(error);
    };
};

//POST METHODS

const createPost = async ({ 
    authorId,
    title,
    content
    }) => {
    try {
        const { rows: [ post ] } = await client.query(`
            INSERT INTO posts ("authorId", title, content)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [authorId, title, content]);

        return post;
    } catch(error) {
        throw error;
    };
};

const updatePost = async (id, fields = {}) => {
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ post ] } = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return post;
    } catch (error) {
      throw error;
    };
  };

const getAllPosts = async () => {
    try {
        const { rows } = await client.query(
            `SELECT * FROM posts;
        `);

        return rows;
    } catch(error) {
        console.error(error);
    };
};

const getPostsByUser = async authorId => {
    try {
        const { rows: posts } = await client.query(`
            SELECT * FROM POSTS
            WHERE "authorId" = $1
        `, [authorId]);

        return posts;
    } catch(error) {
        console.error(error);
    };
};

module.exports = {
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser
};
