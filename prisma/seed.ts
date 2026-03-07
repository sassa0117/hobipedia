import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  // Lottery 1: 一番くじ ワンピース THE BEST EDITION
  const lottery1 = await prisma.lottery.create({
    data: {
      name: "一番くじ ワンピース THE BEST EDITION",
      nameEn: "Ichiban Kuji One Piece THE BEST EDITION",
      slug: "ichiban-kuji-one-piece-the-best-edition",
      series: "ワンピース",
      seriesEn: "One Piece",
      maker: "BANDAI SPIRITS",
      releaseDate: new Date("2024-12-14"),
      price: 850,
      description: "ワンピースの歴代人気キャラクターが集結した豪華ラインナップ。",
      prizes: {
        create: [
          {
            grade: "A賞",
            name: "MASTERLISE マスターライズフィギュア ルフィ太郎",
            nameEn: "MASTERLISE Figure Luffytaro",
            quantity: 2,
            items: {
              create: [
                {
                  name: "MASTERLISE ルフィ太郎フィギュア",
                  nameEn: "MASTERLISE Luffytaro Figure",
                  character: "モンキー・D・ルフィ",
                  characterEn: "Monkey D. Luffy",
                  slug: "one-piece-best-a-luffy",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "B賞",
            name: "MASTERLISE マスターライズフィギュア ゾロ十郎",
            nameEn: "MASTERLISE Figure Zorojuro",
            quantity: 2,
            items: {
              create: [
                {
                  name: "MASTERLISE ゾロ十郎フィギュア",
                  nameEn: "MASTERLISE Zorojuro Figure",
                  character: "ロロノア・ゾロ",
                  characterEn: "Roronoa Zoro",
                  slug: "one-piece-best-b-zoro",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "C賞",
            name: "MASTERLISE マスターライズフィギュア サンジ",
            nameEn: "MASTERLISE Figure Sanji",
            quantity: 2,
            items: {
              create: [
                {
                  name: "MASTERLISE サンジフィギュア",
                  nameEn: "MASTERLISE Sanji Figure",
                  character: "ヴィンスモーク・サンジ",
                  characterEn: "Vinsmoke Sanji",
                  slug: "one-piece-best-c-sanji",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "D賞",
            name: "ちびきゅんキャラ",
            quantity: 30,
            items: {
              create: [
                {
                  name: "ちびきゅんキャラ ルフィ",
                  character: "モンキー・D・ルフィ",
                  slug: "one-piece-best-d-chibi-luffy",
                  category: "ICHIBAN_KUJI",
                },
                {
                  name: "ちびきゅんキャラ ゾロ",
                  character: "ロロノア・ゾロ",
                  slug: "one-piece-best-d-chibi-zoro",
                  category: "ICHIBAN_KUJI",
                },
                {
                  name: "ちびきゅんキャラ ナミ",
                  character: "ナミ",
                  slug: "one-piece-best-d-chibi-nami",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "ラストワン賞",
            name: "MASTERLISE ルフィ ラストワンver.",
            nameEn: "MASTERLISE Luffy Last One ver.",
            quantity: 1,
            items: {
              create: [
                {
                  name: "MASTERLISE ルフィ ラストワンver.フィギュア",
                  nameEn: "MASTERLISE Luffy Last One ver. Figure",
                  character: "モンキー・D・ルフィ",
                  characterEn: "Monkey D. Luffy",
                  slug: "one-piece-best-lastone-luffy",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Lottery 2: 一番くじ 呪術廻戦 ～卍～
  const lottery2 = await prisma.lottery.create({
    data: {
      name: "一番くじ 呪術廻戦 ～卍～",
      nameEn: "Ichiban Kuji Jujutsu Kaisen ~Manji~",
      slug: "ichiban-kuji-jujutsu-kaisen-manji",
      series: "呪術廻戦",
      seriesEn: "Jujutsu Kaisen",
      maker: "BANDAI SPIRITS",
      releaseDate: new Date("2025-01-18"),
      price: 850,
      description: "呪術廻戦の人気キャラクターがフィギュアになって登場。",
      prizes: {
        create: [
          {
            grade: "A賞",
            name: "五条悟フィギュア",
            quantity: 2,
            items: {
              create: [
                {
                  name: "五条悟フィギュア",
                  character: "五条悟",
                  characterEn: "Gojo Satoru",
                  slug: "jjk-manji-a-gojo",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "B賞",
            name: "虎杖悠仁フィギュア",
            quantity: 2,
            items: {
              create: [
                {
                  name: "虎杖悠仁フィギュア",
                  character: "虎杖悠仁",
                  characterEn: "Itadori Yuji",
                  slug: "jjk-manji-b-itadori",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "C賞",
            name: "伏黒恵フィギュア",
            quantity: 2,
            items: {
              create: [
                {
                  name: "伏黒恵フィギュア",
                  character: "伏黒恵",
                  characterEn: "Fushiguro Megumi",
                  slug: "jjk-manji-c-fushiguro",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "ラストワン賞",
            name: "五条悟 ラストワンver.フィギュア",
            quantity: 1,
            items: {
              create: [
                {
                  name: "五条悟 ラストワンver.フィギュア",
                  character: "五条悟",
                  characterEn: "Gojo Satoru",
                  slug: "jjk-manji-lastone-gojo",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Lottery 3: 一番くじ ドラゴンボール VS オムニバスBRAVE
  const lottery3 = await prisma.lottery.create({
    data: {
      name: "一番くじ ドラゴンボール VS オムニバスBRAVE",
      nameEn: "Ichiban Kuji Dragon Ball VS Omnibus BRAVE",
      slug: "ichiban-kuji-dragonball-vs-omnibus-brave",
      series: "ドラゴンボール",
      seriesEn: "Dragon Ball",
      maker: "BANDAI SPIRITS",
      releaseDate: new Date("2025-02-08"),
      price: 850,
      description: "ドラゴンボールの名場面を再現したフィギュアが豪華ラインナップ。",
      prizes: {
        create: [
          {
            grade: "A賞",
            name: "孫悟空 身勝手の極意フィギュア",
            quantity: 2,
            items: {
              create: [
                {
                  name: "孫悟空 身勝手の極意フィギュア",
                  character: "孫悟空",
                  characterEn: "Son Goku",
                  slug: "db-brave-a-goku-ui",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "B賞",
            name: "ベジータフィギュア",
            quantity: 2,
            items: {
              create: [
                {
                  name: "ベジータフィギュア",
                  character: "ベジータ",
                  characterEn: "Vegeta",
                  slug: "db-brave-b-vegeta",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
          {
            grade: "ラストワン賞",
            name: "孫悟空 ラストワンver.フィギュア",
            quantity: 1,
            items: {
              create: [
                {
                  name: "孫悟空 ラストワンver.フィギュア",
                  character: "孫悟空",
                  characterEn: "Son Goku",
                  slug: "db-brave-lastone-goku",
                  category: "ICHIBAN_KUJI",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Add sample price reports
  const items = await prisma.item.findMany();
  for (const item of items) {
    const basePrice = item.slug.includes("lastone")
      ? 8000
      : item.slug.includes("-a-")
        ? 4000
        : item.slug.includes("-b-")
          ? 3000
          : item.slug.includes("-c-")
            ? 2500
            : 800;

    // Generate 3-5 price reports per item
    const reportCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < reportCount; i++) {
      const variance = Math.round(basePrice * (Math.random() * 0.4 - 0.2)); // +/-20%
      const sources = ["MERCARI", "YAHOO_AUCTION", "SURUGAYA"] as const;
      const daysAgo = Math.floor(Math.random() * 60);

      await prisma.priceReport.create({
        data: {
          itemId: item.id,
          price: basePrice + variance,
          source: sources[Math.floor(Math.random() * sources.length)],
          condition: Math.random() > 0.3 ? "未開封" : "開封済み",
          reportedAt: new Date(Date.now() - daysAgo * 86400000),
          verified: Math.random() > 0.5,
        },
      });
    }
  }

  console.log("Seed complete!");
  console.log(`Created ${await prisma.lottery.count()} lotteries`);
  console.log(`Created ${await prisma.prize.count()} prizes`);
  console.log(`Created ${await prisma.item.count()} items`);
  console.log(`Created ${await prisma.priceReport.count()} price reports`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
