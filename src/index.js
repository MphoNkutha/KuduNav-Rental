// import express from "express";
// import router from "./routes/rentalRoutes.js";
// import rental from './models/rental.js';
// import rentalRoutes from './routes/rentalRoutes.js'; // Make sure this matches the file name


// // import { fileURLToPath } from 'url';
// // import { dirname } from 'path';

// const app = express();

// app.use(express.json());

// app.use(router);

// const PORT = process.env.PORT || 3000;
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = dirname(__filename);

// // Define a simple route
// app.get('/', (req, res) => {
//     // res.sendFile(__dirname + '/pages/index.html')
// });

// // Start the server
// // app.listen(PORT, () => {
// //     console.log(`Server is running on http://localhost:${PORT}`);
// // }); 

// export default app;

import express from "express";
import vehicleRoutes from './routes/vehicleRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import webhooks from './routes/webhooks.js';
// import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

const app = express();

// handle options
app.use("/", function (req, res, next) {
    // Allow access request from any computers
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header(
      "Access-Control-Allow-Methods",
      "POST, GET, PUT, DELETE, PATCH, OPTIONS",
    );
    res.header("Access-Control-Allow-Credentials", true);
    if ("OPTIONS" == req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });


const jwtDecode =   (token) => {
    // invalid token - synchronous
    try {
        let decoded = jwt.decode(token, process.env.SECRETKEY);
        return decoded.email
    } catch(err) {
        console.log(err.message)
        return null
    }
}

  // middleware to fetch user object
app.use("/", async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        const token = authHeader.split(" ")[1];
      const user =  jwtDecode(token) || null;
  
      if (user) {
        req.user = user;
      }
    } catch (e) {}
  
    next();
  });
  

app.use(express.json());


// Use the routes
app.use('/', vehicleRoutes);
app.use('/', reservationRoutes);
app.use('/', rentalRoutes);
app.use('/', webhooks)

export default app;