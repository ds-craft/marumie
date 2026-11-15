import { formatAmount, FormattedAmount } from "@/client/lib/financial-calculator";

describe("formatAmount", () => {
  const testCases: Array<{
    description: string;
    input: number;
    expected: FormattedAmount;
  }> = [
    { description: "0円", input: 0, expected: { main: "0", secondary: "", tertiary: "", unit: "円" } },
    { description: "900円", input: 900, expected: { main: "900", secondary: "", tertiary: "", unit: "円" } },
    {
      description: "85,157円（3桁区切り）",
      input: 85157,
      expected: { main: "85,157", secondary: "", tertiary: "", unit: "円" },
    },
    {
      description: "150,000,000円も万円・億円に丸めない",
      input: 150000000,
      expected: { main: "150,000,000", secondary: "", tertiary: "", unit: "円" },
    },
    {
      description: "端数は四捨五入する",
      input: 449.5,
      expected: { main: "450", secondary: "", tertiary: "", unit: "円" },
    },
    {
      description: "マイナス値",
      input: -2320,
      expected: { main: "-2,320", secondary: "", tertiary: "", unit: "円" },
    },
  ];

  it.each(testCases)("should format $description", ({ input, expected }) => {
    expect(formatAmount(input)).toEqual(expected);
  });
});
