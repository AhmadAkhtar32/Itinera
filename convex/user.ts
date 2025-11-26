import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string()
    },
    handler: async (ctx, args) => {
        // If user Already Exist?
        const user = await ctx.db.query('Usertable')
            .filter((q) => q.eq(q.field('email'), args.email))
            .collect();

        if (user?.length == 0) {
            const userData = {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl
            }
            // if Not then create new user
            const result = await ctx.db.insert('Usertable', userData);
            return userData; 
        }
        return user[0];

    }
})