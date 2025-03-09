import axios from "axios";

export async function GET(){
    try{
        const stars = await axios.get("https://api.github.com/repos/bprabin811/PReviewer/stargazers").then((res) => {
            return res.data.length;
        });

        return Response.json({ stars });
    }catch(error){
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error"}), { status: 500 });
    }
}