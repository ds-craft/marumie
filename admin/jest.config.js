module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // 画像処理で頻繁に使う Math の VM 内グローバル参照コストを減らす。
  sandboxInjectedGlobals: ["Math"],
  // テストは tests/ に src/ と同じ階層で置く方針（src/ 配下の *.test.ts は意図的に収集しない）。
  // src/ 配下に置かれたテストは dependency-cruiser の no-tests-in-src ルールで検出される。
  roots: ["<rootDir>/tests"],
  // 単発実行（CI / pnpm verify）では watchman の恩恵が無く、watchman が壊れた環境では
  // jest がテストを 1 件も収集せず exit 0 で素通りするため、常に node crawler で収集する。
  watchman: false,
  // コンポーネントのテスト（*.test.tsx）は、ファイル先頭の @jest-environment jsdom で DOM 環境に切り替える
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/prisma/(.*)$": "<rootDir>/../prisma/$1",
    // DSクラフト: 本家のテストは本家の設定（政治資金の区分・全機能・2025〜2026年）で動かす（shared/testing/upstream-config）
    "^@/shared/accounting/account-category$":
      "<rootDir>/../shared/testing/upstream-config/account-category.ts",
    "^@/shared/features$": "<rootDir>/../shared/testing/upstream-config/features.ts",
    "^@/shared/public-years$": "<rootDir>/../shared/testing/upstream-config/public-years.ts",
    "^@/shared/(.*)$": "<rootDir>/../shared/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/tests/mocks/server-only.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  coverageReporters: ["text", "lcov"],
};
