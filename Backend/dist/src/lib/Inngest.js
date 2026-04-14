import { Inngest } from "inngest";
import User from "@/Models/User";
export const inngest = new Inngest({ id: "videointerviewer" });
const syncUserToInngest = inngest.createFunction({ id: "syncUser", triggers: [{ event: "clerk/user.created" }] }, async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const newUser = {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        profileImage: image_url,
    };
    try {
        await User.create(newUser);
    }
    catch (error) {
        console.error('Error syncing user to database:', error);
    }
});
const deleteUserFromInngest = inngest.createFunction({ id: "deleteUser", triggers: [{ event: "clerk/user.deleted" }] }, async ({ event }) => {
    const { id } = event.data;
    try {
        await User.deleteOne({ clerkId: id });
    }
    catch (error) {
        console.error('Error deleting user from database:', error);
    }
});
export const functions = [syncUserToInngest, deleteUserFromInngest];
