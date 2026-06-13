import ArticlePage from '@/components/article/ArticlePage/ArticlePage';
import articlesData from '@/data/articlesData';

// ─── Dynamic Metadata ─────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = articlesData[id];

  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.titleEnglish,
    description: article.textEnglish?.slice(0, 160) || article.titleEnglish,
    openGraph: {
      title: `${article.titleEnglish} | The Container`,
      description: article.textEnglish?.slice(0, 160),
      url: `https://thecontaineronline.com/info/article/${id}`,
      images: article.imagePath ? [{ url: article.imagePath }] : [],
    },
  };
}

// ─── Article Route ────────────────────────────────────────────
export default async function ArticleRoute({ params }) {
  const { id } = await params;
  return <ArticlePage id={id} />;
}