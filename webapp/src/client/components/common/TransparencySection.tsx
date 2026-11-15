import "server-only";
import GradientMessageCard from "@/client/components/common/GradientMessageCard";

interface TransparencySectionProps {
  title: string;
}

export default function TransparencySection({ title }: TransparencySectionProps) {
  return (
    <GradientMessageCard title={title}>
      DSクラフトの運営にかかったお金は、台帳に記録したものをまるごとここに反映しています。
      <span className="hidden sm:inline">
        <br />
      </span>
      サーバー機材、VPS、ドメインなど、何にいくら使ったかを品目ごとに見られます。
    </GradientMessageCard>
  );
}
