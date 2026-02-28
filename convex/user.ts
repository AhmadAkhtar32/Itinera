import { v } from "convex/values";
import { mutation } from "./_generated/server";

// 1. Create User with Free Credits
export const CreateNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string()
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const user = await ctx.db.query('Usertable')
            .filter((q) => q.eq(q.field('email'), args.email))
            .collect();

        if (user?.length == 0) {
            const userData = {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
                credits: 3,         // 🛠️ Give 3 free trips on signup
                isPro: false        // 🛠️ Default to basic tier
            }
            // Create new user
            const result = await ctx.db.insert('Usertable', userData);
            return userData; 
        }
        return user[0];
    }
});

// 2. Dummy EasyPaisa/JazzCash Verification
export const verifyLocalPayment = mutation({
    args: { 
        email: v.string(), 
        tid: v.string(), 
        method: v.string() // 'easypaisa' or 'jazzcash'
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("Usertable")
            .filter(q => q.eq(q.field("email"), args.email))
            .first();

        if (!user) throw new Error("User not found");

        // Simulate TID Verification
        if (args.tid.length < 10) {
            throw new Error("Invalid Transaction ID. Please check your SMS and try again.");
        }

        // Upgrade the user to Pro and give them unlimited credits
        await ctx.db.patch(user._id, { 
            isPro: true, 
            credits: 9999 
        });

        return { success: true, message: "Welcome to Itinera Pro!" };
    }
});