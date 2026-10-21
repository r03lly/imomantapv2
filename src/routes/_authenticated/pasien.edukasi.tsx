import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock } from "lucide-react";
import hipertensiImage from "@/assets/edukasi-hipertensi.jpg";
import gulaDarahImage from "@/assets/edukasi-gula-darah.jpg";
import kolesterolImage from "@/assets/edukasi-kolesterol.jpg";
import umumImage from "@/assets/edukasi-umum.jpg";

export const Route = createFileRoute("/_authenticated/pasien/edukasi")({
  component: Edukasi,
});

type Article = {
  id: string;
  title: string;
  content: string;
  disease_type: string;
  read_time: number | null;
  tags: string[] | null;
  view_count: number;
};

const articleImages: Record<string, string> = {
  hipertensi: hipertensiImage,
  gula_darah: gulaDarahImage,
  kolesterol: kolesterolImage,
  umum: umumImage,
};

function getArticleImage(diseaseType: string) {
  return articleImages[diseaseType] ?? umumImage;
}

function Edukasi() {
  const [list, setList] = useState<Article[]>([]);
  const [active, setActive] = useState<Article | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("educational_content")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setList((data ?? []) as Article[]);
    })();
  }, []);

  async function open(a: Article) {
    setActive(a);
    await supabase
      .from("educational_content")
      .update({ view_count: (a.view_count ?? 0) + 1 })
      .eq("id", a.id);
  }

  if (active) {
    return (
      <article className="space-y-3">
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <img
          src={getArticleImage(active.disease_type)}
          alt={`Ilustrasi ${active.title}`}
          loading="lazy"
          width={1280}
          height={720}
          className="aspect-video w-full rounded-lg object-cover"
        />
        <h1 className="text-2xl font-bold">{active.title}</h1>
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {active.read_time || 5} mnt · {active.disease_type}
        </p>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">{active.content}</div>
      </article>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Artikel Edukasi</h1>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada artikel.</p>
      ) : (
        list.map((a) => (
          <button
            key={a.id}
            onClick={() => open(a)}
            className="w-full overflow-hidden text-left rounded-xl border bg-card hover:shadow-md transition"
          >
            <img
              src={getArticleImage(a.disease_type)}
              alt=""
              loading="lazy"
              width={1280}
              height={720}
              className="aspect-[16/7] w-full object-cover"
            />
            <div className="p-4">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {a.read_time || 5} mnt · {a.disease_type}
              </p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.content}</p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
