const example = [
    { id: 1, title: "タイトル1", content: "コンテント1" },
    { id: 2, title: "タイトル2", content: "コンテント2" },
]

export async function GET() {
    return new Response(
        JSON.stringify({
            body: { memos: example }
        })
    )
}