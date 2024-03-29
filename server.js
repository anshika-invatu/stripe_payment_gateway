require('dotenv').config()

const express = require('express');
const app = express();

app.use(express.json())
app.use(express.static('public'))

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([

    [1,{ priceInRupees:10000, name: 'JavaScript Tutorial' }],
    [2,{priceInRupees: 20000, name:'Angular Tutorial'}],
])

app.post('/create-checkout-session',async (req,res)=>{
    try{

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item=>{
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name    
                        },
                        unit_amount:storeItem.priceInRupees
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html` ,
            cancel_url: `${process.env.SERVER_URL}/cancel.html`

        })
        res.json({url: session.url})
    }catch(e){

        res.status(500).json({error:e.message})
    }
})

app.listen(3000,()=>{
    console.log(`server is running on http://localhost:3000`);
});