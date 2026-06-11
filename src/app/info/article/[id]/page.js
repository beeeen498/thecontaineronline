import ArticlePage from "@/components/article/ArticlePage/ArticlePage";

// ─── Article Route ────────────────────────────────────────────
export default async function ArticleRoute({ params }) {
  const { id } = await params;
  return <ArticlePage id={id} />;
}
