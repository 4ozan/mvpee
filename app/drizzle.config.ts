import type { Config } from "drizzle-kit"
import * as  dotenv from "dotenv"

if(process.env.NODE_ENV === "production") {
    dotenv.config({path:"env.production"})
}else {
    dotenv.config({path:"env.local"})
}

if(!process.env.DATABASE_URL){
    throw new Error(`no database env provided`)
}

export default {
    schema:"./lib/shema.ts",
    dialect:"postgresql",
    migrations:{
        table:"drizzle_migrations"
    },
    dbCredentials:{
        url:process.env.DATABASE_URL
    },
    out:"/.migrations",
    strict: process.env.NODE_ENV === "production",
} satisfies Config;


