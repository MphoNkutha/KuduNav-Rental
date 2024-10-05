import express from "express";
import Rental from "../models/rental.js";

const router = express.Router();


router.post('/paystack', async (req, res) => {
    const email = req.body.data.customer.email
    const amount = req.body.data.amount / 100

    const rental = new Rental({userId:email, amount})
    await rental.save()
    console.log(rental)
  
    res.send()
})

export default router;