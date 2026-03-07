-- Hobipedia Seed Data: Ichiban Kuji

-- Lottery 1: One Piece
INSERT INTO "Lottery" (id, name, "nameEn", slug, series, "seriesEn", maker, "releaseDate", price, description, "createdAt", "updatedAt")
VALUES ('lot_op_best', '一番くじ ワンピース THE BEST EDITION', 'Ichiban Kuji One Piece THE BEST EDITION', 'ichiban-kuji-one-piece-the-best-edition', 'ワンピース', 'One Piece', 'BANDAI SPIRITS', '2024-12-14', 850, 'ワンピースの歴代人気キャラクターが集結した豪華ラインナップ。', NOW(), NOW());

INSERT INTO "Prize" (id, "lotteryId", grade, name, "nameEn", quantity) VALUES
('pz_op_a', 'lot_op_best', 'A賞', 'MASTERLISE マスターライズフィギュア ルフィ太郎', 'MASTERLISE Figure Luffytaro', 2),
('pz_op_b', 'lot_op_best', 'B賞', 'MASTERLISE マスターライズフィギュア ゾロ十郎', 'MASTERLISE Figure Zorojuro', 2),
('pz_op_c', 'lot_op_best', 'C賞', 'MASTERLISE マスターライズフィギュア サンジ', 'MASTERLISE Figure Sanji', 2),
('pz_op_d', 'lot_op_best', 'D賞', 'ちびきゅんキャラ', NULL, 30),
('pz_op_last', 'lot_op_best', 'ラストワン賞', 'MASTERLISE ルフィ ラストワンver.', 'MASTERLISE Luffy Last One ver.', 1);

INSERT INTO "Item" (id, "prizeId", name, "nameEn", character, "characterEn", slug, category, "createdAt", "updatedAt") VALUES
('it_op_a_luffy', 'pz_op_a', 'MASTERLISE ルフィ太郎フィギュア', 'MASTERLISE Luffytaro Figure', 'モンキー・D・ルフィ', 'Monkey D. Luffy', 'one-piece-best-a-luffy', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_op_b_zoro', 'pz_op_b', 'MASTERLISE ゾロ十郎フィギュア', 'MASTERLISE Zorojuro Figure', 'ロロノア・ゾロ', 'Roronoa Zoro', 'one-piece-best-b-zoro', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_op_c_sanji', 'pz_op_c', 'MASTERLISE サンジフィギュア', 'MASTERLISE Sanji Figure', 'ヴィンスモーク・サンジ', 'Vinsmoke Sanji', 'one-piece-best-c-sanji', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_op_d_luffy', 'pz_op_d', 'ちびきゅんキャラ ルフィ', NULL, 'モンキー・D・ルフィ', NULL, 'one-piece-best-d-chibi-luffy', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_op_d_zoro', 'pz_op_d', 'ちびきゅんキャラ ゾロ', NULL, 'ロロノア・ゾロ', NULL, 'one-piece-best-d-chibi-zoro', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_op_d_nami', 'pz_op_d', 'ちびきゅんキャラ ナミ', NULL, 'ナミ', NULL, 'one-piece-best-d-chibi-nami', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_op_last_luffy', 'pz_op_last', 'MASTERLISE ルフィ ラストワンver.フィギュア', 'MASTERLISE Luffy Last One ver. Figure', 'モンキー・D・ルフィ', 'Monkey D. Luffy', 'one-piece-best-lastone-luffy', 'ICHIBAN_KUJI', NOW(), NOW());

-- Lottery 2: JJK
INSERT INTO "Lottery" (id, name, "nameEn", slug, series, "seriesEn", maker, "releaseDate", price, description, "createdAt", "updatedAt")
VALUES ('lot_jjk_manji', '一番くじ 呪術廻戦 ～卍～', 'Ichiban Kuji Jujutsu Kaisen ~Manji~', 'ichiban-kuji-jujutsu-kaisen-manji', '呪術廻戦', 'Jujutsu Kaisen', 'BANDAI SPIRITS', '2025-01-18', 850, '呪術廻戦の人気キャラクターがフィギュアになって登場。', NOW(), NOW());

INSERT INTO "Prize" (id, "lotteryId", grade, name, quantity) VALUES
('pz_jjk_a', 'lot_jjk_manji', 'A賞', '五条悟フィギュア', 2),
('pz_jjk_b', 'lot_jjk_manji', 'B賞', '虎杖悠仁フィギュア', 2),
('pz_jjk_c', 'lot_jjk_manji', 'C賞', '伏黒恵フィギュア', 2),
('pz_jjk_last', 'lot_jjk_manji', 'ラストワン賞', '五条悟 ラストワンver.フィギュア', 1);

INSERT INTO "Item" (id, "prizeId", name, character, "characterEn", slug, category, "createdAt", "updatedAt") VALUES
('it_jjk_a_gojo', 'pz_jjk_a', '五条悟フィギュア', '五条悟', 'Gojo Satoru', 'jjk-manji-a-gojo', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_jjk_b_itadori', 'pz_jjk_b', '虎杖悠仁フィギュア', '虎杖悠仁', 'Itadori Yuji', 'jjk-manji-b-itadori', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_jjk_c_fushi', 'pz_jjk_c', '伏黒恵フィギュア', '伏黒恵', 'Fushiguro Megumi', 'jjk-manji-c-fushiguro', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_jjk_last_gojo', 'pz_jjk_last', '五条悟 ラストワンver.フィギュア', '五条悟', 'Gojo Satoru', 'jjk-manji-lastone-gojo', 'ICHIBAN_KUJI', NOW(), NOW());

-- Lottery 3: Dragon Ball
INSERT INTO "Lottery" (id, name, "nameEn", slug, series, "seriesEn", maker, "releaseDate", price, description, "createdAt", "updatedAt")
VALUES ('lot_db_brave', '一番くじ ドラゴンボール VS オムニバスBRAVE', 'Ichiban Kuji Dragon Ball VS Omnibus BRAVE', 'ichiban-kuji-dragonball-vs-omnibus-brave', 'ドラゴンボール', 'Dragon Ball', 'BANDAI SPIRITS', '2025-02-08', 850, 'ドラゴンボールの名場面を再現したフィギュアが豪華ラインナップ。', NOW(), NOW());

INSERT INTO "Prize" (id, "lotteryId", grade, name, quantity) VALUES
('pz_db_a', 'lot_db_brave', 'A賞', '孫悟空 身勝手の極意フィギュア', 2),
('pz_db_b', 'lot_db_brave', 'B賞', 'ベジータフィギュア', 2),
('pz_db_last', 'lot_db_brave', 'ラストワン賞', '孫悟空 ラストワンver.フィギュア', 1);

INSERT INTO "Item" (id, "prizeId", name, character, "characterEn", slug, category, "createdAt", "updatedAt") VALUES
('it_db_a_goku', 'pz_db_a', '孫悟空 身勝手の極意フィギュア', '孫悟空', 'Son Goku', 'db-brave-a-goku-ui', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_db_b_vegeta', 'pz_db_b', 'ベジータフィギュア', 'ベジータ', 'Vegeta', 'db-brave-b-vegeta', 'ICHIBAN_KUJI', NOW(), NOW()),
('it_db_last_goku', 'pz_db_last', '孫悟空 ラストワンver.フィギュア', '孫悟空', 'Son Goku', 'db-brave-lastone-goku', 'ICHIBAN_KUJI', NOW(), NOW());

-- Price Reports (sample data)
INSERT INTO "PriceReport" (id, "itemId", price, source, condition, "reportedAt", verified) VALUES
-- One Piece A賞 ルフィ
('pr_1', 'it_op_a_luffy', 4200, 'MERCARI', '未開封', NOW() - INTERVAL '3 days', true),
('pr_2', 'it_op_a_luffy', 3800, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '7 days', true),
('pr_3', 'it_op_a_luffy', 3500, 'SURUGAYA', '開封済み', NOW() - INTERVAL '14 days', true),
('pr_4', 'it_op_a_luffy', 4500, 'MERCARI', '未開封', NOW() - INTERVAL '21 days', false),
-- One Piece B賞 ゾロ
('pr_5', 'it_op_b_zoro', 3200, 'MERCARI', '未開封', NOW() - INTERVAL '2 days', true),
('pr_6', 'it_op_b_zoro', 2900, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '10 days', true),
('pr_7', 'it_op_b_zoro', 3500, 'MERCARI', '未開封', NOW() - INTERVAL '18 days', false),
-- One Piece C賞 サンジ
('pr_8', 'it_op_c_sanji', 2600, 'MERCARI', '未開封', NOW() - INTERVAL '5 days', true),
('pr_9', 'it_op_c_sanji', 2300, 'SURUGAYA', '開封済み', NOW() - INTERVAL '12 days', true),
-- One Piece D賞
('pr_10', 'it_op_d_luffy', 900, 'MERCARI', '未開封', NOW() - INTERVAL '4 days', false),
('pr_11', 'it_op_d_zoro', 750, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '8 days', false),
('pr_12', 'it_op_d_nami', 800, 'MERCARI', '未開封', NOW() - INTERVAL '6 days', false),
-- One Piece ラストワン
('pr_13', 'it_op_last_luffy', 8500, 'MERCARI', '未開封', NOW() - INTERVAL '1 day', true),
('pr_14', 'it_op_last_luffy', 7800, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '9 days', true),
('pr_15', 'it_op_last_luffy', 9200, 'MERCARI', '未開封', NOW() - INTERVAL '20 days', true),
-- JJK A賞 五条
('pr_16', 'it_jjk_a_gojo', 5500, 'MERCARI', '未開封', NOW() - INTERVAL '2 days', true),
('pr_17', 'it_jjk_a_gojo', 5000, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '8 days', true),
('pr_18', 'it_jjk_a_gojo', 4800, 'SURUGAYA', '開封済み', NOW() - INTERVAL '15 days', true),
-- JJK B賞 虎杖
('pr_19', 'it_jjk_b_itadori', 2800, 'MERCARI', '未開封', NOW() - INTERVAL '3 days', true),
('pr_20', 'it_jjk_b_itadori', 2500, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '11 days', false),
-- JJK ラストワン 五条
('pr_21', 'it_jjk_last_gojo', 12000, 'MERCARI', '未開封', NOW() - INTERVAL '1 day', true),
('pr_22', 'it_jjk_last_gojo', 10500, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '6 days', true),
-- DB A賞 悟空
('pr_23', 'it_db_a_goku', 3800, 'MERCARI', '未開封', NOW() - INTERVAL '4 days', true),
('pr_24', 'it_db_a_goku', 3500, 'SURUGAYA', '未開封', NOW() - INTERVAL '10 days', true),
-- DB ラストワン
('pr_25', 'it_db_last_goku', 7500, 'MERCARI', '未開封', NOW() - INTERVAL '2 days', true),
('pr_26', 'it_db_last_goku', 8200, 'YAHOO_AUCTION', '未開封', NOW() - INTERVAL '7 days', true);
