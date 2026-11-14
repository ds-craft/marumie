import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DSクラフト: GitHub Pages で公開する静的サイトとして書き出す（out/）。
  // 静的なホスティングではレスポンスヘッダーを付けられないので、本家の headers()（CSP など）は外している。
  output: "export",
  // /o/ds-craft/2022 と /o/ds-craft/2022/transactions が両方あるので、2022.html ではなく 2022/index.html の形で書き出す
  // （GitHub Pages では同名のファイルとディレクトリが並ぶとファイルの方を開けない）
  trailingSlash: true,
  // 画像の最適化（/_next/image）はサーバーが要るので、静的サイトでは元の画像をそのまま配る
  images: { unoptimized: true },
  // srcディレクトリは自動的に認識されます

  // next dev は AI エージェントを検知すると AGENTS.md / CLAUDE.md をアプリ直下に自動生成する。
  // このリポジトリの正本はリポジトリ直下の CLAUDE.md なので、生成を止めて作業ツリーが汚れないようにする。
  agentRules: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
