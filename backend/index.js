import express from "express"
import cors from "cors"
import { router } from "./Routers/mrRoutes.js"
import { routerAuth } from "./Routers/auth.Router.js"
import { doctorRouter } from "./Routers/doctor.Router.js"


const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', routerAuth);

app.use('/api/mr',router)
app.use('/api/doctor',doctorRouter)

const PORT= process.env.PORT || 5000;

app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
