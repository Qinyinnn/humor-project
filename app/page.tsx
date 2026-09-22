import { createClient } from "@supabase/supabase-js";

{/* connects the app to Supabase */}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function Home() {
  const { data: jokes, error } = await supabase
    .from("jokes")
    .select("*"); {/*Go to the jokes table and retrieve all of its columns and rows. */}

  if (error) {
    return <p>Error loading jokes: {error.message}</p>;
  }

  {/*Display all rows and columns. */}
  return (
    <main>
      <h1>Jokes</h1>

      <ul>
        {jokes.map((joke) => (
          <li key={joke.id}>
            <strong>{joke.setup}</strong>
            <p>{joke.punchline}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}