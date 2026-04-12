import { Inngest } from "inngest";
import User from "@/Models/User";

export const inngest = new Inngest({id : "videointerviewer"});


interface syncDataInterface {
    data: {
        id: string;
        email_addresses: Array<{
            email_address: string;
            [key: string]: unknown;
        }>;
        first_name: string | null;
        last_name: string | null;
        image_url: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

const syncUserToInngest = inngest.createFunction(
    { id : "syncUser", triggers :[ {event : "clerk/user.created"}] },
    async ({ event }: { event: syncDataInterface }) => {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const newUser = {
            clerkId: id,
            email: email_addresses[0].email_address,
            name: `${first_name} ${last_name}`,
            profileImage: image_url,
        }

        try{
            await User.create(newUser);
        }catch(error){
            console.error('Error syncing user to database:', error);
        }
    }  
)

const deleteUserFromInngest = inngest.createFunction(
    { id : "deleteUser", triggers :[ {event : "clerk/user.deleted"}] },
    async ({ event }: { event: syncDataInterface }) => {
        const { id } = event.data;

        try{
            await User.deleteOne({ clerkId: id });
        }catch(error){
            console.error('Error deleting user from database:', error);
        }
    }  
)

export const functions = [syncUserToInngest, deleteUserFromInngest];



