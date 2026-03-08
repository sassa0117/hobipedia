-- Additional seed data: SPY×FAMILY, Haikyu!!, Chainsaw Man
-- Run: npx prisma db execute --file prisma/seed-more.sql

-- Lotteries
INSERT INTO "Lottery" (id, slug, name, series, maker, price, "releaseDate", description, "createdAt", "updatedAt")
VALUES
  ('lot_spyfamily01', 'ichiban-kuji-spy-x-family-mission-start', '一番くじ SPY×FAMILY ～MISSION START!～', 'SPY×FAMILY', 'BANDAI SPIRITS', 850, '2025-03-15', 'SPY×FAMILYの人気キャラクターが勢揃い。アーニャのフィギュアが目玉。', NOW(), NOW()),
  ('lot_haikyu01', 'ichiban-kuji-haikyu-fly-high', '一番くじ ハイキュー!! FLY HIGH', 'ハイキュー!!', 'BANDAI SPIRITS', 850, '2025-02-22', 'ハイキュー!!の名シーンを再現したフィギュア・グッズコレクション。', NOW(), NOW()),
  ('lot_csm01', 'ichiban-kuji-chainsaw-man-chain-of-devils', '一番くじ チェンソーマン CHAIN OF DEVILS', 'チェンソーマン', 'BANDAI SPIRITS', 850, '2025-04-05', 'チェンソーマンの迫力あるフィギュアラインナップ。デンジ＆ポチタが目玉。', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- SPY×FAMILY Prizes
INSERT INTO "Prize" (id, "lotteryId", grade, name, quantity)
VALUES
  ('prz_sf_a', 'lot_spyfamily01', 'A賞', 'MASTERLISE アーニャ・フォージャーフィギュア', 2),
  ('prz_sf_b', 'lot_spyfamily01', 'B賞', 'MASTERLISE ロイド・フォージャーフィギュア', 2),
  ('prz_sf_c', 'lot_spyfamily01', 'C賞', 'ヨル・フォージャー ミニフィギュア', 3),
  ('prz_sf_last', 'lot_spyfamily01', 'ラストワン賞', 'アーニャ スペシャルカラーver.フィギュア', 1)
ON CONFLICT DO NOTHING;

-- SPY×FAMILY Items
INSERT INTO "Item" (id, slug, name, character, "prizeId", "createdAt", "updatedAt")
VALUES
  ('itm_sf_anya', 'spy-family-anya-figure', 'アーニャ・フォージャー フィギュア', 'アーニャ・フォージャー', 'prz_sf_a', NOW(), NOW()),
  ('itm_sf_loid', 'spy-family-loid-figure', 'ロイド・フォージャー フィギュア', 'ロイド・フォージャー', 'prz_sf_b', NOW(), NOW()),
  ('itm_sf_yor', 'spy-family-yor-mini-figure', 'ヨル・フォージャー ミニフィギュア', 'ヨル・フォージャー', 'prz_sf_c', NOW(), NOW()),
  ('itm_sf_anya_last', 'spy-family-anya-lastwan', 'アーニャ スペシャルカラーver. フィギュア', 'アーニャ・フォージャー', 'prz_sf_last', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- SPY×FAMILY Price Reports
INSERT INTO "PriceReport" (id, "itemId", price, source, condition, "reportedAt")
VALUES
  ('pr_sf01', 'itm_sf_anya', 6800, 'MERCARI', '未開封', NOW() - INTERVAL '2 days'),
  ('pr_sf02', 'itm_sf_anya', 7200, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '5 days'),
  ('pr_sf03', 'itm_sf_anya', 5500, 'SURUGAYA', '開封済み', NOW() - INTERVAL '8 days'),
  ('pr_sf04', 'itm_sf_anya', 6500, 'MERCARI', '未開封', NOW() - INTERVAL '12 days'),
  ('pr_sf05', 'itm_sf_loid', 4200, 'MERCARI', '未開封', NOW() - INTERVAL '3 days'),
  ('pr_sf06', 'itm_sf_loid', 3800, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '7 days'),
  ('pr_sf07', 'itm_sf_loid', 3500, 'SURUGAYA', '開封済み', NOW() - INTERVAL '10 days'),
  ('pr_sf08', 'itm_sf_yor', 2800, 'MERCARI', '未開封', NOW() - INTERVAL '1 day'),
  ('pr_sf09', 'itm_sf_yor', 2500, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '6 days'),
  ('pr_sf10', 'itm_sf_anya_last', 15000, 'MERCARI', '未開封', NOW() - INTERVAL '1 day'),
  ('pr_sf11', 'itm_sf_anya_last', 18000, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '4 days'),
  ('pr_sf12', 'itm_sf_anya_last', 12000, 'MANDARAKE', '未開封', NOW() - INTERVAL '9 days')
ON CONFLICT DO NOTHING;

-- Haikyu!! Prizes
INSERT INTO "Prize" (id, "lotteryId", grade, name, quantity)
VALUES
  ('prz_hk_a', 'lot_haikyu01', 'A賞', '日向翔陽フィギュア', 2),
  ('prz_hk_b', 'lot_haikyu01', 'B賞', '影山飛雄フィギュア', 2),
  ('prz_hk_c', 'lot_haikyu01', 'C賞', '及川徹フィギュア', 3)
ON CONFLICT DO NOTHING;

-- Haikyu!! Items
INSERT INTO "Item" (id, slug, name, character, "prizeId", "createdAt", "updatedAt")
VALUES
  ('itm_hk_hinata', 'haikyu-hinata-figure', '日向翔陽 フィギュア', '日向翔陽', 'prz_hk_a', NOW(), NOW()),
  ('itm_hk_kageyama', 'haikyu-kageyama-figure', '影山飛雄 フィギュア', '影山飛雄', 'prz_hk_b', NOW(), NOW()),
  ('itm_hk_oikawa', 'haikyu-oikawa-figure', '及川徹 フィギュア', '及川徹', 'prz_hk_c', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Haikyu!! Price Reports
INSERT INTO "PriceReport" (id, "itemId", price, source, condition, "reportedAt")
VALUES
  ('pr_hk01', 'itm_hk_hinata', 5800, 'MERCARI', '未開封', NOW() - INTERVAL '3 days'),
  ('pr_hk02', 'itm_hk_hinata', 5200, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '6 days'),
  ('pr_hk03', 'itm_hk_kageyama', 4800, 'MERCARI', '未開封', NOW() - INTERVAL '2 days'),
  ('pr_hk04', 'itm_hk_kageyama', 4500, 'SURUGAYA', '開封済み', NOW() - INTERVAL '8 days'),
  ('pr_hk05', 'itm_hk_oikawa', 3500, 'MERCARI', '未開封', NOW() - INTERVAL '4 days'),
  ('pr_hk06', 'itm_hk_oikawa', 3200, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Chainsaw Man Prizes
INSERT INTO "Prize" (id, "lotteryId", grade, name, quantity)
VALUES
  ('prz_csm_a', 'lot_csm01', 'A賞', 'デンジ＆ポチタ フィギュア', 2),
  ('prz_csm_b', 'lot_csm01', 'B賞', 'マキマ フィギュア', 2),
  ('prz_csm_c', 'lot_csm01', 'C賞', 'パワー フィギュア', 3),
  ('prz_csm_last', 'lot_csm01', 'ラストワン賞', 'チェンソーマン 覚醒ver. フィギュア', 1)
ON CONFLICT DO NOTHING;

-- Chainsaw Man Items
INSERT INTO "Item" (id, slug, name, character, "prizeId", "createdAt", "updatedAt")
VALUES
  ('itm_csm_denji', 'csm-denji-pochita-figure', 'デンジ＆ポチタ フィギュア', 'デンジ', 'prz_csm_a', NOW(), NOW()),
  ('itm_csm_makima', 'csm-makima-figure', 'マキマ フィギュア', 'マキマ', 'prz_csm_b', NOW(), NOW()),
  ('itm_csm_power', 'csm-power-figure', 'パワー フィギュア', 'パワー', 'prz_csm_c', NOW(), NOW()),
  ('itm_csm_awakened', 'csm-chainsaw-man-awakened', 'チェンソーマン 覚醒ver. フィギュア', 'チェンソーマン', 'prz_csm_last', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Chainsaw Man Price Reports
INSERT INTO "PriceReport" (id, "itemId", price, source, condition, "reportedAt")
VALUES
  ('pr_csm01', 'itm_csm_denji', 8500, 'MERCARI', '未開封', NOW() - INTERVAL '1 day'),
  ('pr_csm02', 'itm_csm_denji', 9200, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '3 days'),
  ('pr_csm03', 'itm_csm_denji', 7800, 'SURUGAYA', '開封済み', NOW() - INTERVAL '6 days'),
  ('pr_csm04', 'itm_csm_denji', 8000, 'MERCARI', '未開封', NOW() - INTERVAL '10 days'),
  ('pr_csm05', 'itm_csm_makima', 7500, 'MERCARI', '未開封', NOW() - INTERVAL '2 days'),
  ('pr_csm06', 'itm_csm_makima', 6800, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '5 days'),
  ('pr_csm07', 'itm_csm_makima', 7000, 'MANDARAKE', '未開封', NOW() - INTERVAL '8 days'),
  ('pr_csm08', 'itm_csm_power', 6000, 'MERCARI', '未開封', NOW() - INTERVAL '1 day'),
  ('pr_csm09', 'itm_csm_power', 5500, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '4 days'),
  ('pr_csm10', 'itm_csm_power', 5800, 'SURUGAYA', '未開封', NOW() - INTERVAL '7 days'),
  ('pr_csm11', 'itm_csm_awakened', 22000, 'MERCARI', '未開封', NOW() - INTERVAL '2 days'),
  ('pr_csm12', 'itm_csm_awakened', 25000, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '5 days'),
  ('pr_csm13', 'itm_csm_awakened', 19500, 'MANDARAKE', '未開封', NOW() - INTERVAL '9 days')
ON CONFLICT DO NOTHING;
