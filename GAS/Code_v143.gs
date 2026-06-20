/**
 * 現場管理システム ― フルバックエンド v143-2（2026-06-20）v43.8.3 setup getSecret修正＋テストログイン無効化対応版。v143 ログイン列ズレ修正（作業員マスタの列順が古い環境でもログインID/パスワードを正しく読む）。v124 ファイル階層閲覧の高速化：既存Driveフォルダの高速取得・Drive一覧短時間キャッシュ。v117 工事写真台帳の写真情報（工種・撮影箇所・備考）出力対応。v118 工事写真台帳のGenCan標準テンプレートを自動作成し、A4縦3枚/ページの出力体裁を改善。
 * （v107）スプレッドシート自動バックアップ強化：毎日午前2時にDB全体をコピーし、30世代保存。メニューから手動作成・自動設定・状態確認が可能。
 * （v106）config.js共通化対応：GAS URLをフロント側config.jsで一元管理（GAS処理はv105継承）。
 * （v143-login-header-fix-20260620）作業員マスタの列順が古い環境でもログインID/パスワードを正しく読むよう修正。
 * （v143-login-header-fix-20260620）更新履歴/バージョン確認用APIをCode_v143表示へ更新。
 * （v120-auth-stability-20260619）ログインセッション確認・認証切れ時の復帰表示を安定化。
 * （v110-file-speed-20260619）ファイル画面高速化：閲覧時のフォルダ作成確認と共有権限チェックを省略し、一覧を短時間キャッシュ。
 * （v110-login-20260619）ログイン復旧：古いパスワードハッシュが残っていても、パスワード列が一致すれば再ハッシュしてログイン可能に修正。
 * （v108-fix-20260619）写真画面：現場フォルダを開く処理とサブフォルダ内写真一覧を安定化。
 * （v105）写真アップロード成功確認：no-cors送信後にファイル名でDrive保存完了を確認する confirmUpload アクションを追加。
 * （v103）削除データの復元対応：主要データの削除を行削除ではなく「削除済み」フラグに変更。管理者用の削除済み一覧・復元アクションを追加。
 * （v102）操作ログ追加：「操作ログ」シートにログイン・追加・編集・削除・帳票出力などを記録。
 * （v101）パスワードハッシュ化：作業員マスタに「パスワードハッシュ」列を追加。新規・更新時は平文パスワードを保存せずハッシュ化。既存の平文パスワードはログイン成功時に自動でハッシュへ移行し、平文欄を空にします。
 * （旧 v97）見積PDFの行数自動拡張：明細が多い場合、内訳シートの行を雛形から自動複製して最大約150行まで出力（複数ページ対応）。従来は71行で打ち切りだった。AI読取(aiOcr/aiOcrProject)のエラー処理を強化：200応答でもerror本文・空candidates・finishReasonを検知し、分かりやすいメッセージを返す。
 * （旧 v96）案件PDF読取OCR修正：工事名（案件名）と工事場所（住所）の取り違えを防止。案件名には工事名・件名のみ、場所には住所のみが入るようプロンプトを厳格化。
 * （旧 v95）案件PDF読取OCR：aiOcrProject アクション追加（見積書・発注書・契約書から案件名・顧客・工事場所・工期・金額を抽出）。案件管理画面とAIツールから利用。
 * （旧 v94）見積PDF調整：左余白拡大/支払条件削除/有効期限「発行日より〇ヶ月」/金額ラベル見切れ修正/件名フォント自動縮小。v84で郵便番号印字(住所の前)・品名列拡大(250→330)・右余白縮小(0.55→0.45)。見積・請求のExcel(帳票版)出力＋CSV出力を追加（estXlsx/estCsv アクション）。
 * （旧 v79）AI見積もりOCRのプロンプトを建設業全般に拡張＋誤読対策強化（トイレ/漏電/型番）。
 * （旧 v78）AI見積もりOCR（aiOcr）＋ AIチャット（aiChat・Gemini 2.5 Flash・Google検索連携対応）。
 * （旧 v77）建退共手帳番号による青○表示を削除。役割記号の区切りを半角スペースに変更。
 *（旧 v77）作業主任者略字を業→作に修正。現場IDのE7表示を削除。退職金共済欄を「利用区分のみ表示」に変更。
 *（旧 v74）clearContents→clearContentのスペルミス修正（GAS API）。
 *（旧 v73）作業員名簿のsetValueをバッチ化してタイムアウト対策。役割記号を複数選択対応（「/」区切り）。
 *（旧 v72）作業員名簿に提出日・作成年月日・役割記号（※欄）を流し込み。
 *（旧 v71）オフラインビュワー書き出し機能を統合（offlineExport＋メニュー「▶バックアップ→オフラインビュワーを書き出す」）。別トークのv70から移植。
 *（旧 v70）作業員マスタに電話番号/特殊健康診断日/血圧/技能者ID/退職金共済手帳区分を追加。名簿に本人TEL・特殊健診日・血圧・技能者ID・雇用保険下4桁・退職金区分を流し込み（技能者ID欄に雇用保険番号が入る不具合も修正）。
 *（旧 v69）作業員名簿の「教育・資格・免許」を3欄（雇入・職長特別教育／技能講習／免許）に自動振り分け＋文字を7ptに縮小。
 *（旧 v68）作業員名簿の「事業所の名称」欄を会社名→工事名（現場名）に変更。会社名は下段の一次会社名欄に既に表示。
 *（旧 v67）作業員名簿の流し込み項目を拡充（雇入年月日・生年月日・最近の健康診断日・経験年数・年齢・家族連絡先TEL）。住所が家族連絡先欄へ紛れ込むバグも修正。
 *（旧 v66e）全帳票の文字色を黒に統一（青文字→黒）＋v66d背景白化
 * 主な変更：archiveExport（案件の全データを1つのExcelにまとめて案件フォルダへ保存）／
 *           archivePurge（各シートからその案件の行を削除し、希望すればDriveフォルダもゴミ箱へ）
 *（旧 v51）ツールボックスメモの種類フィルター
 * 主な変更：notesList に type パラメータを追加（道具箱v27の全現場一覧で通信量を削減。旧版フロントとも互換）
 *（旧 v50）顧客向け進捗共有
 * 主な変更：案件マスタに「共有トークン」列を追加。shareView（認証不要・トークンで案件特定）で
 *           案件名/場所/工期/状態/予定/写真のみ公開。shareEnable/shareDisable（管理者）でURL発行/停止
 *（旧 v49）バックアップ毎日化＋メール通知
 * 主な変更：自動バックアップを週次→毎日（午前2時）に変更。成功/失敗を運用アカウント宛にメール通知。
 *（旧 v48）写真の工種仕分け
 * 主な変更：uploadPhoto_ に工種パラメータを追加。工種を指定すると 写真/{工種} サブフォルダへ自動振り分け
 *（旧 v47）日報未提出サマリー
 * 主な変更：reportGaps アクション（指定期間の日報未提出を、予定担当ベースで集計）
 *（旧 v46）案件ステータス連動
 * 主な変更：請求書発行で案件を「請求済」に、入金で「請求済」維持。案件ステータスに見積中/請求済を追加（フロント側）
 *（旧 v45）道具・工具管理
 * 主な変更：「道具マスタ」「道具貸出」シートを新設／toolData・toolSave・toolDelete・toolLend・toolReturn アクション
 *（旧 v57）作業員名簿GAS自作→テンプレ流し込み方式に変更
 * （旧 v44）安全書類（作業員名簿）
 * 主な変更：作業員マスタに安全書類用の列を追加／safetyData・rosterPdf アクション（作業員名簿PDF出力）
 *（旧 v43）入金管理・売掛チェック
 * 主な変更：見積請求シートに「入金日」列を追加／estMarkPaid アクション（一覧から1タップ入金記録）／
 *           dashboard_ に売掛サマリー（未入金合計・期限超過）を追加
 *（旧 v42）ダッシュボード強化
 * 主な変更：dashboard_ に「工期間近の案件」「未完了チェックリスト」「自分の勤怠（widパラメータ）」を追加
 *（旧 v41）見積書・請求書機能を追加
 * 主な変更：「見積請求」シート新設／estData・estSave・estDelete・estPdf アクション／
 *           設定シートに会社住所・電話・FAX・インボイス登録番号・振込先・見積有効日数・支払条件を追加
 *（旧 v39）セットアップ半自動化（設定ブロック集約＋setupGenba関数＋▶セットアップメニュー）
 * 主な変更：REPORT_HEADERSに休憩分・深夜人工・翌日を追加
 * ★このファイルをGASエディタに貼り替え、既存デプロイを新バージョンに更新してください。
 * （旧バージョン：v9 打刻仕様変更）
 * v9の変更点（勤怠の打刻を「1行＝1勤務（出勤→退勤のペア）」方式に変更）：
 *   ・出勤を押すと新しい勤務行を作成。1日に何度でも出勤・退勤できる。
 *   ・退勤は「未退勤の勤務（出勤あり・退勤なし）」を閉じる。日付をまたぐ夜勤は出勤日に集計。
 *   ・実働は退勤時に計算（退勤＜出勤なら翌日扱いで+24h）。
 *   ・【新】「現場管理DB」とは別の Google スプレッドシート（＝出勤簿ファイル）に社員ごと1シートで
 *     月次タイムシートを出力（年月/集計欄＋日別：勤怠・出退勤・休憩・勤務時間・普通残業・深夜残業・
 *     休日労働・休日深夜・備考、欄外に出勤位置/退勤位置のGoogleマップリンク）。打刻のたびに自動更新。
 *     ※残業/深夜は標準ルールの目安（所定8h/日・深夜22-5）。土日も「出勤」として通常計算（休日区分は未適用）。
 *     ※欠勤/遅刻/早退/有給/休日は打刻から判定不可のため空欄。1日複数回は日付/勤怠/曜日を結合して各回を行表示。
 *     初回はメニュー「▶勤怠→出勤簿ファイルを更新（全員）」を実行。
 * ★管理者PIN（TOKEN_ADMIN）は『kawaden』に設定済みです。このまま貼り替えてOK（書き換え不要）。
 *   PINを変えたいときは下の TOKEN_ADMIN の値だけ直してください。
 * ★既存の勤怠シートにある「テスト打刻の行」は、1行=1勤務の新方式と混ざるので、
 *   勤怠シートの見出し行（1行目）を残して、それ以下のデータ行を削除してから使ってください。
 * 更新手順: 全部貼り替え →（setup実行は不要）→ 既存デプロイを「新バージョン」で再デプロイ
 *   ※必ず既存デプロイの編集（鉛筆→バージョン:新規）で更新（URLは変わりません）。
 */

/* ★最新版（このファイル）— v14以降に以下を追加済み。プロジェクト内の旧「現場管理_Code_v14...」ではなく、必ずこのファイルを使用してください：
 *   ・勤怠の計算ルール設定（「設定」シート：会社名/定時/締日/丸め単位/所定労働/深夜帯/残業上限・警告率/有給付与日・義務日数・警告日）。アクション settings, saveSettings。
 *   ・締日ベースの月次集計（kintaiRange）と残業・深夜・遅刻・早退の算出（※社労士監修前の「目安」表示）。
 *   ・日本の祝日取得（holidays：内閣府CSVを年単位キャッシュ）。※この機能でUrlFetchApp権限が増えたため、最初の再デプロイ時のみ承認画面が出ます（同意すればOK）。
 *   ・申請ワークフロー（「申請」シート）：有給休暇／代休／残業事前申請／遅刻／早退／在宅勤務／その他。承認すると有給・代休はスケジュールへ終日予定を自動追加。アクション applicationsMine/applicationAdd/applicationCancel/applicationsPending/applicationDecide。
 *   ・有給管理（「有給」シート）：付与・調整・残数集計。アクション leaveMine, leaveSummary, leaveAdd, leaveDelete。
 *   更新手順：全部貼り替え → 既存デプロイを「新バージョン」で再デプロイ（URL・PINは不変）。初回のみ承認画面に同意。
 */

/* ★v14（このファイル）の変更点：
 *   ・【重要修正】作業員・取引先・先方担当者のID発番を「件数+1」→「一意ID」に変更（削除後の追加で既存IDと重複し、別の人が上書き・削除される不具合を解消）。
 *     既存データの重複IDは、デプロイ後にエディタから関数 repairIds を1回実行して修復してください。
 *   ・【追記】案件マスタに「略称」、作業員マスタに「氏・名・略称」の列を追加（日報・スケジュールの表示やフォームで使用）。
 *   ・【追記】カレンダー用データ(calendarData)に作業員一覧を同梱（スケジュールの担当者を社員・協力業者から選べるように）。
 *   ・【修正】使うシートが無い場合は見出し付きで自動作成（setup未実行でも「シートがありません」になりません）。
 *   ・「取引先」マスタを整備：顧客マスタに「区分（企業／官公庁／協力業者）」列を追加。既存の顧客は区分が空＝企業として扱います。
 *   ・「先方担当者マスタ」を新設（取引先・担当者名・役職・電話・メール）。管理画面から登録、各画面でプルダウン選択に使います。
 *   ・取引先の更新/削除、先方担当者の追加/更新/削除アクションを追加（管理者のみ）。一覧の取得は誰でも可（プルダウン用）。
 *   ・all / calendarData / reportData の応答に取引先・先方担当者を同梱。
 *   〔v13〕案件（現場）の追加・編集・削除を誰でも可能に開放（顧客・社員マスタ追加と勤怠削除は管理者のみ）。
 *   〔v12〕現場フォルダを「ファイル／図面／書類／写真」の4つに。写真の中に「調査／施工／完了」を自動生成。案件マスタに先方担当者/電話番号/メールアドレス列を追加。
 *   更新手順：全部貼り替え → 既存デプロイを「新バージョン」で再デプロイ（URL・PINは変わりません）。※新シート作成のため、初回は一度「setup」を実行すると確実です（しなくても保存時に自動生成されます）。
 */
/* ================================================================
   ★★★ 初期設定（ここだけ変更してください）★★★
   購入後、下の3項目を自社用に書き換えてから
   メニュー「▶セットアップ」→「初期設定を実行」を1回押すだけで
   シート・フォルダ・自動バックアップが揃います。
   ================================================================ */
var COMPANY_NAME  = '河口電機';              // ① 会社名（Driveフォルダ名・帳票に使用）
var TOKEN_ADMIN   = 'kawaden';               // ② 管理者PIN（金額表示・社員/顧客登録／4〜12文字程度）
var TOKEN_GENERAL = 'CHANGE_ME_RANDOM_32CHARS'; // ③ 旧方式互換用。公開HTMLには書かない。必ずランダム値へ変更
var TEST_LOGIN_ENABLED = true; // ★一時テスト用：テスト完了後は必ず false に戻してください
/* ================================================================
   ↑↑↑ 変更が必要なのは上の3項目だけ。あとは自動でセットされます。
   ================================================================ */

var SHEET_PROJECTS='案件マスタ', SHEET_CUSTOMERS='顧客マスタ', SHEET_WORKERS='作業員マスタ', SHEET_REPORTS='作業日報', SHEET_SCHEDULE='スケジュール', SHEET_KINTAI='勤怠', SHEET_CONTACTS='先方担当者マスタ', SHEET_SETTINGS='設定', SHEET_APPLICATIONS='申請', SHEET_LEAVE='有給';
var SHEET_AUDIT='操作ログ';
var AUDIT_HEADERS=['ログID','日時','操作者ID','操作者名','権限','操作','対象ID','対象名','結果','概要','補足'];
var PARENT_FOLDER_NAME=COMPANY_NAME+'_現場管理';

var PROJECT_HEADERS=['案件ID','案件名','顧客','場所','種別','ステータス','工期開始','工期完了','受注金額税抜','受注金額税込','実行予算','担当','段取り','Driveフォルダ','備考','登録日時','更新日時','先方担当者','電話番号','メールアドレス','略称','LINE_URL','共有トークン'];
var CUSTOMER_HEADERS=['顧客ID','顧客名','担当者','電話','住所','備考','登録日時','区分'];
var CONTACT_HEADERS=['担当者ID','取引先','担当者名','役職','電話','メール','備考','登録日時','更新日時'];
var WORKER_HEADERS=['作業員ID','氏名','区分','所属','権限','利用状態','標準単価','表示順','備考','登録日時','ログインID','パスワード','パスワードハッシュ','氏','名','略称','ふりがな','生年月日','血液型','雇入年月日','経験年数','職種','住所','緊急連絡先名','緊急連絡先続柄','緊急連絡先電話','保有資格','最近の健康診断日','雇用保険番号','建退共手帳番号','健康保険','厚生年金','雇用保険','電話番号','特殊健康診断日','血圧','技能者ID','退職金共済手帳区分'];
var OFFLINE_ROW_LIMIT = 3000; // オフラインビュワー：1シートあたり最大行数（超えた分はカット＋注記）
var REPORT_HEADERS=['日報ID','日付','案件ID','案件名','作業員ID','氏名','区分','所属','作業内容','開始','終了','作業時間','人工','単価','労務費','備考','登録日時','更新日時','休憩分','深夜人工','翌日','車両'];
/* 〔v23〕現場メモ（ツールボックス）+ 工事台帳・原価管理 */
var SHEET_NOTES='現場メモ';
var NOTE_HEADERS=['メモID','案件ID','種類','タイトル','内容','作成者ID','作成者名','登録日時','更新日時'];
var SHEET_COSTS='原価';
var COST_HEADERS=['原価ID','案件ID','日付','区分','取引先','内容','金額','備考','登録日時','更新日時'];
/* 〔v25〕工事車両管理：「車両マスタ」シートを新設。車検・保険・オイル交換の管理と、
 *   スケジュール（車両列）・作業日報（車両列）・工事台帳（車両使用日数）との連携用バックエンド。 */
var SHEET_VEHICLES='車両マスタ';
var SHEET_SUPPLIERS='仕入先';
var VEHICLE_HEADERS=['車両ID','車両名','ナンバー','車種','車検満了日','車検番号','保険会社','保険証券番号','保険開始日','保険満了日','オイル交換距離','オイル交換月数','前回オイル交換日','前回オイル交換距離','現在距離','距離更新日','日額単価','表示順','備考','登録日時','更新日時'];
var SCHEDULE_HEADERS=['予定ID','日付','終了日','案件ID','案件名','予定内容','区分','担当','開始','終了','備考','登録日時','更新日時','車両'];
var KINTAI_HEADERS=['勤怠ID','日付','作業員ID','氏名','出勤','退勤','休憩分','実働時間','現場ID','現場名','出勤位置','退勤位置','備考','登録日時','更新日時'];
var SETTINGS_HEADERS=['キー','値'];
var SETTINGS_DEFAULT={'会社名':COMPANY_NAME,'定時開始':'09:00','定時終了':'18:00','締日':'15','丸め単位':'15','所定労働時間':'8','深夜開始':'22:00','深夜終了':'05:00','残業上限月':'45','残業警告率':'80','有給付与日':'04-01','有給義務日数':'5','有給警告日':'180',
  '社名上段':'','社名下段':'','会社郵便番号':'','会社住所':'','会社電話':'','会社FAX':'','インボイス登録番号':'','振込先':'','見積有効日数':'30','支払条件':'月末締め翌月末払い','建設業許可番号':'','許可業種':'','代表者名':'','監理技術者名':'','監理技術者資格':'','現場代理人名':''};
var APPLICATION_HEADERS=['申請ID','申請日時','作業員ID','氏名','種別','対象日','詳細','修正_出勤','修正_退勤','修正_休憩分','状態','処理日時'];
var LEAVE_HEADERS=['記録ID','作業員ID','氏名','区分','日付','日数','メモ','登録日時'];
/* 〔v57〕書類管理（資格の写し・許可票など） */
var SHEET_DOCS='書類管理';
var DOC_HEADERS=['書類ID','種別','対象ID','書類名','DriveFileId','DriveFileUrl','MIME','備考','登録日時'];

/* 〔v56〕施工体制台帳・再下請負通知書 */
var SHEET_DAIKO='下請業者';
var DAIKO_HEADERS=['下請ID','案件ID','種別','親下請ID','会社名','建設業許可番号','許可業種','代表者名','住所','電話','主任技術者名','主任技術者資格','工種','請負金額','工期開始','工期完了','備考','登録日時','更新日時'];

/* 〔v45〕道具・工具管理 */
var SHEET_TOOLS='道具マスタ';
var TOOL_HEADERS=['道具ID','道具名','区分','管理番号','保有数','状態','保管場所','備考','表示順','登録日時','更新日時'];
var SHEET_TOOLLEND='道具貸出';
var TOOLLEND_HEADERS=['貸出ID','道具ID','道具名','数量','作業員ID','作業員名','現場ID','現場名','貸出日','返却予定日','返却日','状態','備考','登録日時','更新日時'];
/* 〔v41〕見積書・請求書 */
var SHEET_EST='見積請求';
var EST_HEADERS=['伝票ID','種別','伝票番号','案件ID','案件名','顧客名','宛名','件名','発行日','期限','明細','小計','消費税','合計','状態','備考','PDF','入金日','登録日時','更新日時'];

function setup(){
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss,SHEET_PROJECTS,PROJECT_HEADERS); ensureSheet_(ss,SHEET_CUSTOMERS,CUSTOMER_HEADERS);
  ensureSheet_(ss,SHEET_WORKERS,WORKER_HEADERS); ensureSheet_(ss,SHEET_REPORTS,REPORT_HEADERS);
  ensureSheet_(ss,SHEET_SCHEDULE,SCHEDULE_HEADERS); ensureSheet_(ss,SHEET_KINTAI,KINTAI_HEADERS);
  ensureSheet_(ss,SHEET_CONTACTS,CONTACT_HEADERS);
  ensureSheet_(ss,SHEET_SETTINGS,SETTINGS_HEADERS);
  ensureSheet_(ss,SHEET_APPLICATIONS,APPLICATION_HEADERS);
  ensureSheet_(ss,SHEET_LEAVE,LEAVE_HEADERS);
  ensureSheet_(ss,SHEET_AUDIT,AUDIT_HEADERS);
  ensureSheet_(ss,SHEET_NOTES,NOTE_HEADERS);
  ensureSheet_(ss,SHEET_COSTS,COST_HEADERS);
  ensureSheet_(ss,SHEET_VEHICLES,VEHICLE_HEADERS);
  // 既存シートに不足列を追加（ログインID・パスワード／先方担当者／取引先の区分など）
  ensureColumns_(ss.getSheetByName(SHEET_WORKERS),WORKER_HEADERS);
  ensureColumns_(ss.getSheetByName(SHEET_PROJECTS),PROJECT_HEADERS);
  ensureColumns_(ss.getSheetByName(SHEET_CUSTOMERS),CUSTOMER_HEADERS);
  ensureColumns_(ss.getSheetByName(SHEET_CONTACTS),CONTACT_HEADERS);
  ensureColumns_(ss.getSheetByName(SHEET_AUDIT),AUDIT_HEADERS);
  getParent_();
  try{ SpreadsheetApp.getUi().alert('セットアップ完了（v7・ログイン対応）。'); }catch(e){}
}
function ensureSheet_(ss,name,headers){ var sh=ss.getSheetByName(name); if(!sh)sh=ss.insertSheet(name);
  var f=sh.getRange(1,1,1,headers.length).getValues()[0];
  if(f.every(function(v){return v===''||v===null;})){ sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold'); sh.setFrozenRows(1);} }
function ensureColumns_(sh,headers){ if(!sh)return; var lastCol=sh.getLastColumn();
  var cur=lastCol>0?sh.getRange(1,1,1,lastCol).getValues()[0]:[];
  headers.forEach(function(h){ if(cur.indexOf(h)<0){ lastCol++; sh.getRange(1,lastCol).setValue(h).setFontWeight('bold'); cur.push(h);} }); }

// v143: 既存DBで列順が古い場合でも、見出し名で安全に読み書きするヘルパー
function actualHeaders_(sh,headers){
  if(headers) ensureColumns_(sh,headers);
  var lastCol=Math.max(1,sh.getLastColumn());
  return sh.getRange(1,1,1,lastCol).getValues()[0].map(function(h){return String(h||'').trim();});
}
function rowToObjByActualHeaders_(sh,r,headers){
  var actual=actualHeaders_(sh,headers);
  var row=sh.getRange(r,1,1,actual.length).getValues()[0];
  var o={}; headers.forEach(function(h){var idx=actual.indexOf(h); o[h]=fmt_(idx>=0?row[idx]:'');});
  actual.forEach(function(h,i){ if(h && o[h]===undefined)o[h]=fmt_(row[i]); });
  return o;
}
function appendObjByActualHeaders_(sh,headers,rec){
  var actual=actualHeaders_(sh,headers);
  sh.appendRow(actual.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
}
function setObjByActualHeaders_(sh,r,headers,rec){
  var actual=actualHeaders_(sh,headers);
  sh.getRange(r,1,1,actual.length).setValues([actual.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
}

function doGet(e){ return handle_(e,(e&&e.parameter)||{}); }
function doPost(e){ var p={}; try{p=JSON.parse(e.postData.contents);}catch(err){} return handle_(e,p); }

function roleOf_(s){ s=String(s||'').trim(); var si=sessionInfo_(s); if(si&&si.role)return si.role; if(s===TOKEN_ADMIN)return'admin'; if(s===TOKEN_GENERAL)return'general'; return''; }
function needAdmin_(role){ if(role!=='admin') throw '権限がありません（管理者のみ）'; }


/* ===== v128: 作業員ごとの権限管理 =====
   権限列が空の場合は、区分から安全側で自動判定します。
   管理者 / 現場責任者 / 社員 / 現場作業員 / 閲覧のみ / 停止
*/
function normalizeAppRole_(v){
  v=String(v||'').trim().toLowerCase();
  if(!v)return '';
  if(v==='admin'||v==='管理者'||v==='administrator')return 'admin';
  if(v==='manager'||v==='現場責任者'||v==='責任者'||v==='職長')return 'manager';
  if(v==='staff'||v==='社員'||v==='事務')return 'staff';
  if(v==='field'||v==='現場作業員'||v==='作業員'||v==='常用')return 'field';
  if(v==='viewer'||v==='閲覧'||v==='閲覧のみ')return 'viewer';
  if(v==='disabled'||v==='停止'||v==='利用停止')return 'disabled';
  return v;
}
function roleLabel_(role){
  role=normalizeAppRole_(role);
  return role==='admin'?'管理者':role==='manager'?'現場責任者':role==='staff'?'社員':role==='field'?'現場作業員':role==='viewer'?'閲覧のみ':role==='disabled'?'停止':'社員';
}
function workerAppRole_(w){
  w=w||{};
  var st=String(w['利用状態']||'').trim();
  if(st==='停止'||st==='利用停止'||st==='無効')return 'disabled';
  var r=normalizeAppRole_(w['権限']);
  if(r)return r;
  var k=String(w['区分']||'').trim();
  if(/常用|協力|外注|応援|下請/.test(k))return 'field';
  return 'staff';
}
function menuPermissionsForRole_(role){
  role=normalizeAppRole_(role)||'staff';
  var base={version:1,help:1};
  var all=['quick','projects','report','timecard','calendar','files','photos','aitools','toolbox','material','vehicles','tools','safety','estimate','daicho','admin','setup','diagnosis','update','version','help'];
  var sets={
    admin: all,
    manager:['quick','projects','report','timecard','calendar','files','photos','aitools','toolbox','material','vehicles','tools','safety','estimate','daicho','version','help'],
    staff:['quick','projects','report','timecard','calendar','files','photos','aitools','toolbox','material','vehicles','tools','version','help'],
    field:['quick','projects','report','timecard','files','photos','toolbox','version','help'],
    viewer:['projects','files','photos','version','help'],
    disabled:['version','help']
  };
  var arr=sets[role]||sets.staff, out={};
  arr.forEach(function(x){out[x]=1;});
  Object.keys(base).forEach(function(k){out[k]=1;});
  return out;
}
function attachWorkerPermission_(w){
  w=w||{};
  var role=workerAppRole_(w);
  w['権限']=w['権限']||roleLabel_(role);
  w['利用状態']=w['利用状態']||'有効';
  w.appRole=role;
  w.roleLabel=roleLabel_(role);
  w.permissions=menuPermissionsForRole_(role);
  return w;
}
function permissionInfo_(secret){
  var role=roleOf_(secret);
  var w=currentWorkerFromSecret_(secret)||{};
  if(role==='admin' && !w['氏名']) w={氏名:'管理者',権限:'管理者',利用状態:'有効'};
  attachWorkerPermission_(w);
  return {role:role, roleLabel:roleLabel_(role), worker:w, permissions:menuPermissionsForRole_(role)};
}
function listPermissionWorkers_(){
  return listWorkers_().map(function(w){
    w=attachWorkerPermission_(w);
    return {
      '作業員ID':w['作業員ID'], '氏名':w['氏名'], '区分':w['区分'], '所属':w['所属'],
      'ログインID':w['ログインID'], '権限':w['権限'], '利用状態':w['利用状態'], appRole:w.appRole, roleLabel:w.roleLabel
    };
  });
}
function updateWorkerPermission_(id,data){
  data=data||{};
  var d={};
  if(Object.prototype.hasOwnProperty.call(data,'権限')) d['権限']=roleLabel_(data['権限']);
  if(Object.prototype.hasOwnProperty.call(data,'利用状態')) d['利用状態']=String(data['利用状態']||'有効').trim()||'有効';
  return updateWorker_(id,d);
}

/* ===== v100: 権限強化ヘルパー =====
   - 一般ユーザーは本人の日報・本人の勤怠削除など最小限のみ許可。
   - 案件・予定・マスタ・発注在庫などの重要操作は管理者のみ。
*/
function currentWorkerFromSecret_(secret){
  var si=sessionInfo_(secret);
  return (si&&si.worker)?si.worker:null;
}
function currentWorkerIdFromSecret_(secret){
  var w=currentWorkerFromSecret_(secret);
  return w?String(w['作業員ID']||''):'';
}
function needOwnWorker_(role, secret, wid){
  if(role==='admin') return;
  var me=currentWorkerIdFromSecret_(secret);
  if(!me) throw '権限がありません（ログイン本人のみ）';
  if(String(wid||'') && String(wid||'')!==me) throw '権限がありません（本人分のみ）';
}
function needAdminOrOwnReport_(role, secret, reportId){
  if(role==='admin') return;
  var me=currentWorkerIdFromSecret_(secret);
  if(!me) throw '権限がありません（本人の日報のみ）';
  var sh=sheet_(SHEET_REPORTS), r=findRow_(sh,'日報ID',reportId);
  if(r<0) throw '日報IDが見つかりません: '+reportId;
  var rec=rowToObj_(sh,r,REPORT_HEADERS);
  if(String(rec['作業員ID']||'')!==me) throw '権限がありません（本人の日報のみ編集・削除できます）';
}
function needAdminOrOwnKintai_(role, secret, kintaiId){
  if(role==='admin') return;
  var me=currentWorkerIdFromSecret_(secret);
  if(!me) throw '権限がありません（本人の勤怠のみ）';
  var sh=sheet_(SHEET_KINTAI), r=findRow_(sh,'勤怠ID',kintaiId);
  if(r<0) throw '勤怠IDが見つかりません: '+kintaiId;
  var rec=rowToObj_(sh,r,KINTAI_HEADERS);
  if(String(rec['作業員ID']||'')!==me) throw '権限がありません（本人の勤怠のみ）';
}
function needAdminOrOwnNote_(role, secret, noteId){
  if(role==='admin') return;
  var me=currentWorkerIdFromSecret_(secret);
  if(!me) throw '権限がありません（本人のメモのみ）';
  var sh=sheet_(SHEET_NOTES), r=findRow_(sh,'メモID',noteId);
  if(r<0) throw 'メモIDが見つかりません: '+noteId;
  var rec=rowToObj_(sh,r,NOTE_HEADERS);
  if(String(rec['作成者ID']||'')!==me) throw '権限がありません（本人のメモのみ編集・削除できます）';
}

/* ===== v99: 短時間セッショントークン =====
   - 公開HTMLに共通あいことばや管理者PINを置かないための仕組み。
   - ログイン成功時 / 管理者PIN確認時にランダムな token を返す。
   - フロントは token だけを保存し、PINや共通あいことばは保存しない。
*/
var SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30日間
function issueSession_(role, worker){
  role=String(role||'general');
  var raw = Utilities.getUuid() + ':' + Utilities.getUuid() + ':' + new Date().getTime();
  var tok = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw)).replace(/=+$/,'');
  var exp = new Date().getTime() + SESSION_TTL_SECONDS*1000;
  var obj = {role:role, exp:exp, worker:worker||null};
  CacheService.getScriptCache().put('sess_'+tok, JSON.stringify(obj), SESSION_TTL_SECONDS);
  try{ PropertiesService.getScriptProperties().setProperty('sess_'+tok, JSON.stringify(obj)); }catch(e){}
  return {token:tok, expiresAt:exp, role:role};
}
function sessionInfo_(tok){
  tok=String(tok||'').trim(); if(!tok) return null;
  var s='';
  try{s=CacheService.getScriptCache().get('sess_'+tok)||'';}catch(e){}
  if(!s){ try{s=PropertiesService.getScriptProperties().getProperty('sess_'+tok)||'';}catch(e){} }
  if(!s) return null;
  var o=null; try{o=JSON.parse(s);}catch(e){return null;}
  if(!o || !o.exp || new Date().getTime()>Number(o.exp)){
    try{PropertiesService.getScriptProperties().deleteProperty('sess_'+tok);}catch(e){}
    return null;
  }
  // Cacheが消えていた場合は復元
  try{CacheService.getScriptCache().put('sess_'+tok, JSON.stringify(o), Math.max(60, Math.floor((Number(o.exp)-new Date().getTime())/1000)));}catch(e){}
  return o;
}
function revokeSession_(tok){ tok=String(tok||'').trim(); if(!tok)return; try{PropertiesService.getScriptProperties().deleteProperty('sess_'+tok);}catch(e){} }


/* ===== v102: 操作ログ =====
   重要操作を「操作ログ」シートに記録します。
   パスワード・認証トークン・画像base64・AI本文などは保存しないよう除外します。
*/
function auditActor_(role, secret){
  var w=currentWorkerFromSecret_(secret);
  if(w) return {id:String(w['作業員ID']||''), name:String(w['氏名']||''), role:role||''};
  return {id:'', name:(role==='admin'?'管理者':''), role:role||''};
}
function shouldAuditAction_(a){
  a=String(a||'');
  var m={
    login:1, logout:1, checkRole:1, migratePasswords:1, deletedList:1, restoreDeleted:1, restorePhoto:1,
    addReport:1, addReportMulti:1, updateReport:1, deleteReport:1,
    uploadPhoto:1, deletePhotos:1, makeLedgerFiles:1,
    addSchedule:1, updateSchedule:1, deleteSchedule:1,
    punch:1, updateKintai:1, deleteKintai:1, kintaiAdd:1, kintaiDeleteOwn:1,
    applicationAdd:1, applicationCancel:1, applicationDecide:1,
    leaveAdd:1, leaveDelete:1, saveSettings:1,
    addProject:1, updateProject:1, deleteProject:1,
    addCustomer:1, updateCustomer:1, deleteCustomer:1,
    addContact:1, updateContact:1, deleteContact:1,
    addWorker:1, updateWorker:1, deleteWorker:1,
    noteSave:1, noteDelete:1, costSave:1, costDelete:1,
    vehicleSave:1, vehicleDelete:1, vehicleOdo:1,
    supplierSave:1, supplierDelete:1,
    productSave:1, productDelete:1, orderSave:1, orderDelete:1, stockAdjust:1,
    estSave:1, estDelete:1, estPdf:1, estXlsx:1, estCsv:1, estMarkPaid:1,
    rosterPdf:1, rosterXlsx:1, daikoSave:1, daikoDelete:1, taiseiPdf:1, saitekePdf:1, henseiPdf:1,
    docUpload:1, docDelete:1,
    toolSave:1, toolDelete:1, toolLend:1, toolReturn:1,
    shareEnable:1, shareDisable:1,
    archiveExport:1, offlineExport:1, archivePurge:1, clearAll:1
  };
  return !!m[a];
}
function sanitizeForAudit_(v, depth){
  depth=depth||0;
  if(depth>3) return '[省略]';
  if(v===null || v===undefined) return v;
  if(typeof v==='string'){
    if(v.length>200) return v.slice(0,200)+'...';
    return v;
  }
  if(typeof v==='number' || typeof v==='boolean') return v;
  if(Array.isArray(v)) return v.slice(0,10).map(function(x){return sanitizeForAudit_(x,depth+1);});
  if(typeof v==='object'){
    var o={};
    Object.keys(v).forEach(function(k){
      var lk=String(k).toLowerCase();
      if(k==='pw'||k==='パスワード'||k==='パスワードハッシュ'||k==='secret'||k==='token'||k==='TOKEN_GENERAL'||k==='TOKEN_ADMIN'||k==='base64'||k==='b64'||k==='messages'||lk.indexOf('password')>=0){ o[k]='[非記録]'; return; }
      o[k]=sanitizeForAudit_(v[k],depth+1);
    });
    return o;
  }
  return String(v);
}
function auditTargetId_(params, pay){
  params=params||{}; pay=pay||{};
  if(params.id) return String(params.id);
  if(params.fileId) return String(params.fileId);
  if(params.ids) return String(params.ids).slice(0,200);
  var d=params.data||{};
  var keys=['案件ID','日報ID','予定ID','勤怠ID','作業員ID','顧客ID','担当者ID','メモID','原価ID','車両ID','仕入先ID','商品ID','発注ID','伝票ID','下請ID','道具ID','貸出ID','記録ID','申請ID','書類ID'];
  for(var i=0;i<keys.length;i++){ if(d&&d[keys[i]]) return String(d[keys[i]]); }
  var objs=['project','report','schedule','kintai','worker','customer','contact','note','cost','vehicle','supplier','product','order','est','tool','lend'];
  for(var j=0;j<objs.length;j++){
    var obj=pay[objs[j]]; if(!obj) continue;
    for(var k=0;k<keys.length;k++){ if(obj[keys[k]]) return String(obj[keys[k]]); }
  }
  return '';
}
function auditTargetName_(params, pay){
  var d=(params&&params.data)||{}; pay=pay||{};
  var keys=['案件名','氏名','顧客名','担当者名','車両名','商品名','道具名','件名','タイトル','書類名','現場名'];
  for(var i=0;i<keys.length;i++){ if(d&&d[keys[i]]) return String(d[keys[i]]); }
  var objs=['project','report','schedule','kintai','worker','customer','contact','note','cost','vehicle','supplier','product','order','est','tool','lend'];
  for(var j=0;j<objs.length;j++){
    var obj=pay[objs[j]]; if(!obj) continue;
    for(var k=0;k<keys.length;k++){ if(obj[keys[k]]) return String(obj[keys[k]]); }
  }
  return '';
}
function logAction_(params, role, result, pay, note){
  try{
    params=params||{};
    var a=String(params.action||'');
    if(!shouldAuditAction_(a)) return;
    var sh=sheet_(SHEET_AUDIT); ensureColumns_(sh,AUDIT_HEADERS);
    var actor=auditActor_(role, params.secret);
    var summary={action:a, id:params.id||'', ids:params.ids||'', data:params.data?sanitizeForAudit_(params.data):''};
    var summaryText=JSON.stringify(summary);
    if(summaryText.length>1500) summaryText=summaryText.slice(0,1500)+'...';
    var rec={
      'ログID':uid_('L'),
      '日時':new Date(),
      '操作者ID':actor.id,
      '操作者名':actor.name,
      '権限':actor.role,
      '操作':a,
      '対象ID':auditTargetId_(params,pay||{}),
      '対象名':auditTargetName_(params,pay||{}),
      '結果':result||'OK',
      '概要':summaryText,
      '補足':String(note||'')
    };
    sh.appendRow(AUDIT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
  }catch(e){ Logger.log('操作ログ記録失敗: '+e); }
}
function listAuditLogs_(limit){
  limit=Math.max(1,Math.min(Number(limit||200),1000));
  var sh=sheet_(SHEET_AUDIT); ensureColumns_(sh,AUDIT_HEADERS);
  var last=sh.getLastRow(); if(last<2)return [];
  var start=Math.max(2,last-limit+1), num=last-start+1;
  var rows=sh.getRange(start,1,num,AUDIT_HEADERS.length).getValues().map(function(r){return rowArrToObj_(r,AUDIT_HEADERS);});
  rows.reverse();
  return rows;
}

function handle_(e,params){
  var cb=(e&&e.parameter&&e.parameter.callback)?e.parameter.callback:'';
  try{

    // v109: 接続確認用。ログイン前でもフロントからGAS疎通を確認できます。
    if(params.action==='ping'){ return json_({ok:true,version:'v143-login-header-fix',appVersion:'v2026.06.20-43.8.3',gasFile:'Code_v143.gs',time:new Date().toISOString()},cb); }
    if(params.action==='versionInfo'){ return json_(versionInfo_(),cb); }
    // 〔v50〕顧客向け進捗共有：共有トークンで案件を特定（ログイン認証は不要・公開情報のみ）
    if(params.action==='shareView'){ return json_(shareView_(params.token),cb); }
    // ログインだけは公開あいことば不要。成功後に短時間トークンを返す。
    if(params.action==='login'){
      var w=login_(params.id,params.pw);
      if(!w){ logAction_({action:'login',data:{id:params.id}},'', 'NG', {}, 'IDまたはパスワードが違います'); return json_({ok:false,error:'IDまたはパスワードが違います'},cb); }
      if(w._loginError){ logAction_({action:'login',data:{id:params.id}},'', 'NG', {}, w._loginError); return json_({ok:false,error:w._loginError},cb); }
      w=attachWorkerPermission_(w);
      var loginRole=w.appRole||workerAppRole_(w);
      var ssn=issueSession_(loginRole,w);
      logAction_({action:'login',secret:ssn.token,data:{id:params.id}},loginRole,'OK',{},'ログイン成功');
      return json_({ok:true,worker:w,token:ssn.token,expiresAt:ssn.expiresAt,role:loginRole,permissions:menuPermissionsForRole_(loginRole)},cb);
    }
    // v43-test: 一時確認用。?test=1 のテストログインボタンから呼び出します。
    // テスト完了後は TEST_LOGIN_ENABLED を false に戻し、GASを再デプロイしてください。
    if(params.action==='testLogin'){
      if(!TEST_LOGIN_ENABLED){ return json_({ok:false,error:'テストログインは無効です'},cb); }
      var tw={
        '作業員ID':'TEST_ADMIN',
        '氏名':'テスト管理者',
        '氏':'テスト',
        '名':'管理者',
        '区分':'社員',
        '所属':'テスト',
        '権限':'管理者',
        '利用状態':'有効',
        appRole:'admin'
      };
      tw=attachWorkerPermission_(tw);
      var tssn=issueSession_('admin',tw);
      logAction_({action:'login',secret:tssn.token,data:{id:'TEST_LOGIN'}},'admin','OK',{},'一時テストログイン');
      return json_({ok:true,worker:tw,token:tssn.token,expiresAt:tssn.expiresAt,role:'admin',permissions:menuPermissionsForRole_('admin'),testLogin:true},cb);
    }
    var role=roleOf_(params.secret);
    if(!role){ logAction_({action:String(params.action||''),data:{reason:'auth_error'}},'', 'NG', {}, '認証エラー'); return json_({ok:false,error:'認証エラー'},cb); }
    if(params.action==='logout'){ logAction_(params,role,'OK',{},'ログアウト'); revokeSession_(params.secret); return json_({ok:true},cb); }
    if(params.action==='checkRole'){
      var out={ok:true,role:role};
      // PIN/旧あいことば/既存トークンのどれで確認しても、新しい短時間トークンを返す
      var curSession=sessionInfo_(params.secret);
      var ssn2=issueSession_(role, curSession&&curSession.worker ? curSession.worker : null); out.token=ssn2.token; out.expiresAt=ssn2.expiresAt;
      if(curSession&&curSession.worker){ out.worker=attachWorkerPermission_(curSession.worker); }
      out.permissions=menuPermissionsForRole_(role); out.roleLabel=roleLabel_(role);
      logAction_(params,role,'OK',{},'権限確認');
      return json_(out,cb);
    }
    if(typeof params.data==='string'&&(params.data.charAt(0)=='{'||params.data.charAt(0)=='[')){ try{params.data=JSON.parse(params.data);}catch(er){params.data={};} }
    if(typeof params.messages==='string'&&params.messages.charAt(0)=='['){ try{params.messages=JSON.parse(params.messages);}catch(er){params.messages=[];} }
    var a=params.action||'all', pay;
    switch(a){
      case 'list':          pay={projects:listProjects_()}; break;
      case 'customers':     pay={customers:listCustomers_()}; break;
      case 'contacts':      pay={contacts:listContacts_()}; break;
      case 'all':           pay={projects:listProjects_(),customers:listCustomers_(),contacts:listContacts_()}; break;
      case 'filesData':     pay={projects:listProjects_(),customers:listCustomers_()}; break;
      case 'filesHomeData': pay=filesHomeData_(); break;
      case 'reportData':    pay={projects:listProjects_(),workers:listWorkers_(),reports:listReports_(),customers:listCustomers_(),contacts:listContacts_(),vehicles:listVehicles_()}; break;
      case 'workers':       pay={workers:listWorkers_()}; break;
      case 'permissionInfo': pay=permissionInfo_(params.secret); break;
      case 'permissionWorkers': needAdmin_(role); pay={workers:listPermissionWorkers_()}; break;
      case 'updateWorkerPermission': needAdmin_(role); pay={worker:updateWorkerPermission_(params.id,params.data||{})}; break;
      case 'migratePasswords': needAdmin_(role); pay=migrateWorkerPasswords_(); break;
      case 'setupStatus':  needAdmin_(role); pay=setupStatus_(); break;
      case 'setupRepair':  needAdmin_(role); pay=setupRepair_(); break;
      case 'setupWizardSave': needAdmin_(role); pay=setupWizardSave_(params.data||{}); break;
      case 'setupBackupEnable': needAdmin_(role); installDailySpreadsheetBackup(); pay=setupStatus_(); break;
      case 'setupBackupDisable': needAdmin_(role); setupBackupDisable_(); pay=setupStatus_(); break;
      case 'backupStatus': needAdmin_(role); pay=backupStatusWeb_(); break;
      case 'backupNow': needAdmin_(role); pay=backupNowWeb_(); break;
      case 'backupList': needAdmin_(role); pay={backups:listBackups_(params.limit||30), folderUrl:backupFolder_().getUrl()}; break;
      case 'backupEnable': needAdmin_(role); installDailySpreadsheetBackup(); pay=backupStatusWeb_(); break;
      case 'backupDisable': needAdmin_(role); setupBackupDisable_(); pay=backupStatusWeb_(); break;
      case 'backupOfflineExport': needAdmin_(role); pay=backupOfflineExportToDrive_(); break;
      case 'diagnosisStatus': needAdmin_(role); pay=diagnosisStatus_(params.secret); break;
      case 'diagnosisRepair': needAdmin_(role); pay=setupRepair_(); break;
      case 'versionInfo':    pay=versionInfo_(); break;
      case 'auditLogs':     needAdmin_(role); pay={logs:listAuditLogs_(params.limit)}; break;
      case 'deletedList':   needAdmin_(role); pay={rows:listDeletedRows_(params.sheet||params.type||'')}; break;
      case 'restoreDeleted':needAdmin_(role); pay={restored:restoreDeletedRow_(params.sheet||params.type||'',params.id)}; break;
      case 'restorePhoto':  needAdmin_(role); try{DriveApp.getFileById(String(params.id||'')).setTrashed(false); pay={restored:true};}catch(e){pay={restored:false,error:String(e)}}; break;
      case 'reports':       pay={reports:listReports_()}; break;
      case 'addReport':     pay={report:addReport_(params.data||{})}; break;
      case 'addReportMulti':pay={reports:addReportMulti_(params.data||{})}; break;
      case 'updateReport':  needAdminOrOwnReport_(role,params.secret,params.id); pay={report:updateReport_(params.id,params.data||{})}; break;
      case 'deleteReport':  needAdminOrOwnReport_(role,params.secret,params.id); pay={deleted:deleteReport_(params.id,params.secret)}; break;
      case 'ensureFolder':  { var f=getCaseFolder_(params.id); pay={url:f.getUrl(),photoUrl:ensureSub_(f,'写真').getUrl(),fileUrl:ensureSub_(f,'ファイル').getUrl(),drawUrl:ensureSub_(f,'図面').getUrl(),schedUrl:ensureSub_(f,'工程表').getUrl(),docUrl:ensureSub_(f,'書類').getUrl()}; break; }
      case 'listPhotos':    pay={photos:listPhotos_(params.id)}; break;
      case 'listFiles':     pay={files:listFiles_(params.id)}; break;
      case 'uploadPhoto':   pay={name:uploadPhoto_(params)}; break;
      case 'confirmUpload':  pay=confirmUpload_(params); break;
      case 'calendarData':  pay={projects:listProjects_(),schedules:listSchedules_(),workers:listWorkers_(),customers:listCustomers_(),contacts:listContacts_(),vehicles:listVehicles_()}; break;
      case 'schedules':     pay={schedules:listSchedules_()}; break;
      case 'addSchedule':   pay={schedule:addSchedule_(params.data||{})}; break;
      case 'updateSchedule':needAdmin_(role); pay={schedule:updateSchedule_(params.id,params.data||{})}; break;
      case 'deleteSchedule':needAdmin_(role); pay={deleted:deleteSchedule_(params.id,params.secret)}; break;
      case 'punchData':     pay={workers:listOwnWorkers_(),kintai:kintaiForToday_(params.date)}; break;
      case 'punch':         pay={kintai:punch_(params.data||{})}; break;
      case 'kintaiMonth':   pay={kintai:kintaiByMonth_(params.ym)}; break;
      case 'updateKintai':  needAdmin_(role); pay={kintai:updateKintai_(params.id,params.data||{})}; break;
      case 'deleteKintai':  needAdmin_(role); pay={deleted:deleteKintai_(params.id,params.secret)}; break;
      case 'kintaiByDate':  pay={kintai:kintaiByDate_(params.date)}; break;
      case 'kintaiRange':   pay={kintai:kintaiRange_(params.from,params.to)}; break;
      case 'settings':      pay={settings:getSettings_()}; break;
      case 'holidays':      pay={holidays:getHolidays_(params.from,params.to)}; break;
      case 'applicationsMine':    pay={apps:applicationsByWorker_(params.wid)}; break;
      case 'applicationAdd':      pay={app:applicationAdd_(params.data||{})}; break;
      case 'applicationCancel':   pay={ok:applicationCancelOwn_(params.id,params.wid,params.secret)}; break;
      case 'applicationsPending': needAdmin_(role); pay={apps:applicationsPending_()}; break;
      case 'applicationDecide':   needAdmin_(role); pay=applicationDecide_(params.id,params.decision); break;
      case 'leaveMine':     pay={leave:leaveMine_(params.wid)}; break;
      case 'leaveSummary':  needAdmin_(role); pay={rows:leaveSummary_()}; break;
      case 'leaveAdd':      needAdmin_(role); pay={leave:leaveAdd_(params.data||{})}; break;
      case 'leaveDelete':   needAdmin_(role); pay={deleted:leaveDelete_(params.id,params.secret)}; break;
      case 'saveSettings':  needAdmin_(role); pay={settings:saveSettings_(params.data||{})}; break;
      case 'kintaiAdd':     needAdmin_(role); pay={kintai:kintaiAdd_(params.data||{})}; break;
      case 'kintaiDeleteOwn': needAdminOrOwnKintai_(role,params.secret,params.id); pay={deleted:kintaiDeleteOwn_(params.id, role==='admin'?params.wid:currentWorkerIdFromSecret_(params.secret), params.secret)}; break;
      case 'addProject':    pay={project:addProject_(params.data||{})}; break;   // 誰でも登録可
      case 'updateProject': needAdmin_(role); pay={project:updateProject_(params.id,params.data||{})}; break;
      case 'deleteProject': needAdmin_(role); pay={deleted:deleteProject_(params.id,params.secret)}; break;
      case 'addCustomer':   needAdmin_(role); pay={customer:addCustomer_(params.data||{})}; break;
      case 'updateCustomer':needAdmin_(role); pay={customer:updateCustomer_(params.id,params.data||{})}; break;
      case 'deleteCustomer':needAdmin_(role); pay={deleted:deleteCustomer_(params.id,params.secret)}; break;
      case 'addContact':    needAdmin_(role); pay={contact:addContact_(params.data||{})}; break;
      case 'updateContact': needAdmin_(role); pay={contact:updateContact_(params.id,params.data||{})}; break;
      case 'deleteContact': needAdmin_(role); pay={deleted:deleteContact_(params.id,params.secret)}; break;
      case 'addWorker':     needAdmin_(role); pay={worker:addWorker_(params.data||{})}; break;
      case 'updateWorker':  needAdmin_(role); pay={worker:updateWorker_(params.id,params.data||{})}; break;
      case 'deleteWorker':  needAdmin_(role); pay={deleted:deleteWorker_(params.id,params.secret)}; break;
      case 'notesList':     pay={notes:listNotes_(params.id,params.type)}; break;
      case 'noteSave':      if(params.data&&params.data['メモID']) needAdminOrOwnNote_(role,params.secret,params.data['メモID']); pay={note:(params.data&&params.data['メモID'])?updateNote_(params.data['メモID'],params.data):addNote_(params.data||{})}; break;
      case 'noteDelete':    needAdminOrOwnNote_(role,params.secret,params.id); pay={deleted:deleteNote_(params.id,params.secret)}; break;
      case 'costData':      needAdmin_(role); pay={projects:listProjects_(),customers:listCustomers_(),costs:listCosts_(),labor:laborByProject_(),vehicles:listVehicles_(),vehicleUsage:vehicleUsage_(),suppliers:listSuppliers_()}; break;
      case 'costSave':      needAdmin_(role); pay={cost:(params.data&&params.data['原価ID'])?updateCost_(params.data['原価ID'],params.data):addCost_(params.data||{})}; break;
      case 'costDelete':    needAdmin_(role); pay={deleted:deleteCost_(params.id,params.secret)}; break;
      case 'aiOcr':         needAdmin_(role); pay=aiOcrEstimate_(params.base64||'',params.mime||'application/pdf'); break;
      case 'aiOcrProject':  needAdmin_(role); pay=aiOcrProject_(params.base64||'',params.mime||'application/pdf'); break;
      case 'aiChat':        pay=aiChat_(params.messages||[],params.system||''); break;
      case 'materialOcr':    pay=materialOcr_(params.base64||'',params.mime||'image/jpeg'); break;
      case 'materialSearch': pay=materialSearch_(params.q||params.query||''); break;
      case 'materialIdentify': pay=materialIdentify_(params.base64||'',params.mime||'image/jpeg'); break;
      case 'dashboard':     pay=dashboard_(params.wid); break;
      case 'vehicles':      pay={vehicles:listVehicles_()}; break;
      case 'vehicleSave':   needAdmin_(role); pay={vehicle:(params.data&&params.data['車両ID'])?updateVehicle_(params.data['車両ID'],params.data):addVehicle_(params.data||{})}; break;
      case 'vehicleDelete': needAdmin_(role); pay={deleted:deleteVehicle_(params.id,params.secret)}; break;
      case 'vehicleOdo':    pay={vehicle:vehicleOdo_(params.data||{})}; break;
      case 'suppliers':      pay={suppliers:listSuppliers_()}; break;
      case 'supplierSave':   needAdmin_(role); pay={supplier:supplierSave_(params.data||{})}; break;
      case 'supplierDelete': needAdmin_(role); pay={deleted:supplierDelete_(params.id,params.secret)}; break;
      case 'orderData':     pay={suppliers:listSuppliers_(),products:listProducts_(),matLists:listNotes_('','mat'),projects:listProjects_()}; break;
      case 'products':      pay={products:listProducts_()}; break;
      case 'productSave':   needAdmin_(role); pay={product:productSave_(params.data||{})}; break;
      case 'productDelete': needAdmin_(role); pay={deleted:productDelete_(params.id,params.secret)}; break;
      case 'orders':        pay={orders:listOrders_()}; break;
      case 'orderSave':     needAdmin_(role); pay={order:orderSave_(params.data||{})}; break;
      case 'orderDelete':   needAdmin_(role); pay={deleted:orderDelete_(params.id,params.secret)}; break;
      case 'stockAdjust':   needAdmin_(role); pay={product:stockAdjust_(params.data||{})}; break;
      case 'stockLog':      pay={log:listStockLog_()}; break;
      /* ===== ファイル・写真系（v28 Google Drive風フォルダ閲覧を追加）===== */
      case 'projectDriveRoot': { var _df=getCaseFolderFast_(params.id); pay=driveItemsCachedPayload_(_df); pay.rootId=_df.getId(); pay.url=_df.getUrl(); break; }
      case 'driveItems':       { var _di=DriveApp.getFolderById(params.fid); pay=driveItemsCachedPayload_(_di); break; }
      case 'photoFolders':   { var _pf=getCaseFolder_(params.id),_ps=ensureSub_(_pf,'写真'),_fo=[];collectFolders_(_ps,'',_fo);pay={rootId:_ps.getId(),folders:_fo}; break; }
      case 'photosByFolder': { var _fd=DriveApp.getFolderById(params.fid),_ph=[];collectPhotos_(_fd,_ph);_ph.sort(function(a,b){return a.name<b.name?1:-1;});pay={photos:_ph}; break; }
      case 'deletePhotos':   { needAdmin_(role); var _ids=String(params.ids||'').split(',').filter(Boolean),_del=0;_ids.forEach(function(id){try{DriveApp.getFileById(id.trim()).setTrashed(true);_del++;}catch(e){}});pay={deleted:_del}; break; }
      case 'getPhotoB64':    { var _gf=DriveApp.getFileById(params.fileId),_blob=_gf.getBlob();pay={b64:Utilities.base64Encode(_blob.getBytes()),mime:_blob.getContentType(),ok:true}; break; }
      case 'makeLedgerFiles': pay=makeLedgerFiles_(params); break;
      case 'ledgerFiles':     pay=listLedgerFiles_(params); break;
      case 'estData':    needAdmin_(role); pay={estimates:listEst_(),projects:listProjects_(),customers:listCustomers_(),settings:getSettings_()}; break;
      case 'estSave':    needAdmin_(role); pay={est:estSave_(params.data||{})}; break;
      case 'estDelete':  needAdmin_(role); pay={deleted:estDelete_(params.id,params.secret)}; break;
      case 'estPdf':     needAdmin_(role); pay=estPdf_(params.id, params.tax); break;
      case 'estXlsx':    needAdmin_(role); pay=estXlsx_(params.id); break;
      case 'estCsv':     needAdmin_(role); pay=estCsv_(params.id); break;
      case 'estMarkPaid':needAdmin_(role); pay={est:estMarkPaid_(params.id,params.date,params.paid)}; break;
      case 'safetyData': needAdmin_(role); pay={workers:listWorkers_(),projects:listProjects_(),customers:listCustomers_(),settings:getSettings_()}; break;
      case 'rosterPdf':  needAdmin_(role); pay=rosterPdf_(params); break;
      case 'rosterXlsx': needAdmin_(role); pay=rosterXlsx_(params); break;
      case 'daikoData':  needAdmin_(role); pay=daikoData_(params); break;
      case 'daikoSave':  needAdmin_(role); pay=daikoSave_(params); break;
      case 'daikoDelete':needAdmin_(role); pay=daikoDelete_(params); break;
      case 'taiseiPdf':  needAdmin_(role); pay=taiseiPdf_(params); break;
      case 'saitekePdf': needAdmin_(role); pay=saitekePdf_(params); break;
      case 'henseiPdf':  needAdmin_(role); pay=henseiPdf_(params); break;
      case 'docList':    needAdmin_(role); pay=docList_(params); break;
      case 'docUpload':  needAdmin_(role); pay=docUpload_(params); break;
      case 'docDelete':  needAdmin_(role); pay=docDelete_(params); break;
      case 'toolData':   pay={tools:listTools_(),lends:listToolLends_(),workers:listWorkers_(),projects:listProjects_()}; break;
      case 'toolSave':   needAdmin_(role); pay={tool:(params.data&&params.data['道具ID'])?updateTool_(params.data['道具ID'],params.data):addTool_(params.data||{})}; break;
      case 'toolDelete': needAdmin_(role); pay={deleted:deleteTool_(params.id,params.secret)}; break;
      case 'toolLend':   pay={lend:toolLend_(params.data||{})}; break;
      case 'toolReturn': pay={lend:toolReturn_(params.id,params.date)}; break;
      case 'reportGaps': needAdmin_(role); pay=reportGaps_(params.from,params.to); break;
      case 'shareEnable':  needAdmin_(role); pay=shareEnable_(params.id); break;
      case 'shareDisable': needAdmin_(role); pay={ok:shareDisable_(params.id)}; break;
      case 'shareStatus':  needAdmin_(role); pay=shareStatus_(params.id); break;
      case 'archiveExport': needAdmin_(role); pay=archiveExport_(params.id); break;
      case 'offlineExport': needAdmin_(role); pay=offlineExport_(); break;
      case 'archivePurge':  needAdmin_(role); pay=archivePurge_(params.id,params.trash); break;
      case 'clearAll':      needAdmin_(role); pay={cleared:clearAllData_()}; break;
      default:              return json_({ok:false,error:'不明なaction: '+a},cb);
    }
    logAction_(params,role,'OK',pay,'');
    return out_(role,pay,cb);
  }catch(err){ logAction_(params,(typeof role!=='undefined'?role:''),'NG',{},String(err)); return json_({ok:false,error:String(err)},cb); }
}

function out_(role,pay,cb){
  if(role==='general'){
    (pay.projects||[]).forEach(stripProj_); if(pay.project)stripProj_(pay.project);
    (pay.reports||[]).forEach(stripRep_);  if(pay.report)stripRep_(pay.report);
    (pay.workers||[]).forEach(stripWk_);   if(pay.worker)stripWk_(pay.worker);
    (pay.vehicles||[]).forEach(stripVeh_); if(pay.vehicle)stripVeh_(pay.vehicle);
  } else { (pay.workers||[]).forEach(function(w){delete w['パスワード']; delete w['パスワードハッシュ'];}); if(pay.worker){delete pay.worker['パスワード']; delete pay.worker['パスワードハッシュ'];} }
  pay.ok=true; return json_(pay,cb);
}
function stripProj_(o){ delete o['受注金額税抜']; delete o['受注金額税込']; delete o['実行予算']; return o; }
function stripRep_(o){ delete o['単価']; delete o['労務費']; return o; }
function stripWk_(o){ delete o['標準単価']; delete o['パスワード']; delete o['パスワードハッシュ']; delete o['ログインID']; return o; }
function stripVeh_(o){ delete o['日額単価']; return o; }

function login_(id,pw){
  // v143: 作業員マスタの列順が古い環境でも、見出し名でログインID/パスワードを読む
  id=String(id||'').trim();
  pw=String(pw==null?'':pw).trim();
  if(!id)return null;
  var sh=sheet_(SHEET_WORKERS);
  var actual=actualHeaders_(sh,WORKER_HEADERS);
  var last=sh.getLastRow(); if(last<2)return null;
  var rows=sh.getRange(2,1,last-1,actual.length).getValues();
  var ixLogin=actual.indexOf('ログインID'), ixPw=actual.indexOf('パスワード'), ixHash=actual.indexOf('パスワードハッシュ');
  if(ixLogin<0)return null;
  for(var i=0;i<rows.length;i++){
    var loginId=String(rows[i][ixLogin]||'').trim();
    if(loginId!==id) continue;
    var obj={};
    WORKER_HEADERS.forEach(function(h){var idx=actual.indexOf(h); obj[h]=fmt_(idx>=0?rows[i][idx]:'');});
    actual.forEach(function(h,j){ if(h && obj[h]===undefined)obj[h]=fmt_(rows[i][j]); });
    var savedHash=String(obj['パスワードハッシュ']||'').trim();
    var legacyPw=String(obj['パスワード']==null?'':obj['パスワード']).trim();
    var user={'作業員ID':obj['作業員ID'],'氏名':obj['氏名'],'区分':obj['区分'],'所属':obj['所属'],'権限':obj['権限'],'利用状態':obj['利用状態']};
    if(workerAppRole_(user)==='disabled') return {_loginError:'このアカウントは利用停止中です'};

    if(savedHash && verifyPassword_(pw,savedHash)){ return user; }

    if(legacyPw && legacyPw===pw){
      var newHash=hashPassword_(pw);
      if(ixHash>=0) sh.getRange(i+2,ixHash+1).setValue(newHash);
      if(ixPw>=0) sh.getRange(i+2,ixPw+1).setValue('');
      return user;
    }

    if(savedHash && savedHash.indexOf('sha256$')!==0 && savedHash===pw){
      var newHash2=hashPassword_(pw);
      if(ixHash>=0) sh.getRange(i+2,ixHash+1).setValue(newHash2);
      if(ixPw>=0) sh.getRange(i+2,ixPw+1).setValue('');
      return user;
    }
  }
  return null; }

function rowArrToObj_(arr,headers){ var o={}; headers.forEach(function(h,i){o[h]=arr[i];}); return o; }

function hashPassword_(pw){
  pw=String(pw==null?'':pw);
  var salt=Utilities.getUuid().replace(/-/g,'');
  var digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt+'|'+pw+'|'+TOKEN_GENERAL);
  return 'sha256$'+salt+'$'+Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}
function verifyPassword_(pw,stored){
  stored=String(stored||''); pw=String(pw==null?'':pw);
  var parts=stored.split('$');
  if(parts.length!==3 || parts[0]!=='sha256') return false;
  var salt=parts[1];
  var digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt+'|'+pw+'|'+TOKEN_GENERAL);
  var calc='sha256$'+salt+'$'+Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
  return calc===stored;
}
function normalizeWorkerPasswordData_(data, existing){
  data=data||{}; existing=existing||{};
  // 画面側からハッシュ列を直接上書きされないようにする
  delete data['パスワードハッシュ'];
  if(Object.prototype.hasOwnProperty.call(data,'パスワード')){
    var pw=String(data['パスワード']==null?'':data['パスワード']);
    if(pw){ data['パスワードハッシュ']=hashPassword_(pw); data['パスワード']=''; }
    else{ delete data['パスワード']; }
  }
  // 既存が平文だけの場合は、編集保存時にも可能なら移行
  if(!data['パスワードハッシュ'] && !existing['パスワードハッシュ'] && existing['パスワード']){
    data['パスワードハッシュ']=hashPassword_(String(existing['パスワード']));
    data['パスワード']='';
  }
  return data;
}
function migrateWorkerPasswords_(){
  var sh=sheet_(SHEET_WORKERS);
  var actual=actualHeaders_(sh,WORKER_HEADERS);
  var last=sh.getLastRow(); if(last<2)return {updated:0};
  var rows=sh.getRange(2,1,last-1,actual.length).getValues();
  var ixPw=actual.indexOf('パスワード'), ixHash=actual.indexOf('パスワードハッシュ'), updated=0;
  if(ixPw<0 || ixHash<0)return {updated:0};
  rows.forEach(function(row,i){
    var pw=String(row[ixPw]==null?'':row[ixPw]);
    var hs=String(row[ixHash]||'');
    if(pw && !hs){
      sh.getRange(i+2,ixHash+1).setValue(hashPassword_(pw));
      sh.getRange(i+2,ixPw+1).setValue('');
      updated++;
    }
  });
  return {updated:updated};
}

// ===== 案件 =====
function listProjects_(){ return readAll_(SHEET_PROJECTS,PROJECT_HEADERS,'案件ID'); }
function addProject_(data){ var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{ var sh=sheet_(SHEET_PROJECTS),id=data['案件ID']||newProjectId_(),now=new Date();
    ensureColumns_(sh,PROJECT_HEADERS);
    var rec=merge_(blank_(PROJECT_HEADERS),data);rec['案件ID']=id;rec['登録日時']=now;rec['更新日時']=now;
    sh.appendRow(PROJECT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec);
  }finally{lock.releaseLock();} }
function updateProject_(id,data){ var sh=sheet_(SHEET_PROJECTS);ensureColumns_(sh,PROJECT_HEADERS);var r=findRow_(sh,'案件ID',id);if(r<0)throw'案件IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,PROJECT_HEADERS),data);rec['案件ID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,PROJECT_HEADERS.length).setValues([PROJECT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteProject_(id,secret){ return softDeleteById_(SHEET_PROJECTS,'案件ID',id,secret); }
function newProjectId_(){ var y=new Date().getFullYear(),ids=listProjects_().map(function(o){return String(o['案件ID']||'');}),max=0,re=new RegExp('^'+y+'-(\\d+)$');
  ids.forEach(function(s){var m=s.match(re);if(m)max=Math.max(max,parseInt(m[1],10));});return y+'-'+('0000'+(max+1)).slice(-4); }

// ===== 取引先（顧客マスタ：区分=企業/官公庁/協力業者）=====
function listCustomers_(){ return readAll_(SHEET_CUSTOMERS,CUSTOMER_HEADERS,'顧客ID'); }

function readLite_(name,cols,keyCol){
  var sh=sheet_(name),last=sh.getLastRow(); if(last<2)return [];
  var lastCol=Math.max(1,sh.getLastColumn());
  var actual=sh.getRange(1,1,1,lastCol).getValues()[0];
  var data=sh.getRange(2,1,last-1,lastCol).getValues();
  return data.map(function(row){
    var o={};
    cols.forEach(function(h){var idx=actual.indexOf(h); o[h]=fmt_(idx>=0?row[idx]:'');});
    ['削除済み','削除日時','削除者ID','削除者名'].forEach(function(h){var idx=actual.indexOf(h); if(idx>=0)o[h]=fmt_(row[idx]);});
    return o;
  }).filter(function(o){return String(o[keyCol]||'')!=='' && !isDeletedObj_(o);});
}
function filesHomeData_(){
  // 写真ファイル画面の初期表示用。必要最小限の列だけ返して、読み込みを軽くする。
  return {
    projects: readLite_(SHEET_PROJECTS,['案件ID','案件名','顧客','種別','発注者区分','区分','工期開始','工期完了','開始日','終了予定日','終了日'],'案件ID'),
    customers: readLite_(SHEET_CUSTOMERS,['顧客ID','顧客名','区分'],'顧客ID')
  };
}

function addCustomer_(data){ var sh=sheet_(SHEET_CUSTOMERS);ensureColumns_(sh,CUSTOMER_HEADERS);var now=new Date(),id=data['顧客ID']||uid_('C');
  var rec=merge_(blank_(CUSTOMER_HEADERS),data);rec['顧客ID']=id;rec['登録日時']=now;
  sh.appendRow(CUSTOMER_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function updateCustomer_(id,data){ var sh=sheet_(SHEET_CUSTOMERS);ensureColumns_(sh,CUSTOMER_HEADERS);var r=findRow_(sh,'顧客ID',id);if(r<0)throw'取引先IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,CUSTOMER_HEADERS),data);rec['顧客ID']=id;
  sh.getRange(r,1,1,CUSTOMER_HEADERS.length).setValues([CUSTOMER_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteCustomer_(id,secret){ return softDeleteById_(SHEET_CUSTOMERS,'顧客ID',id,secret); }

// ===== 先方担当者マスタ =====
function listContacts_(){ return readAll_(SHEET_CONTACTS,CONTACT_HEADERS,'担当者ID'); }
function addContact_(data){ var sh=sheet_(SHEET_CONTACTS);ensureColumns_(sh,CONTACT_HEADERS);var now=new Date(),id=data['担当者ID']||uid_('K');
  var rec=merge_(blank_(CONTACT_HEADERS),data);rec['担当者ID']=id;rec['登録日時']=now;rec['更新日時']=now;
  sh.appendRow(CONTACT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function updateContact_(id,data){ var sh=sheet_(SHEET_CONTACTS);ensureColumns_(sh,CONTACT_HEADERS);var r=findRow_(sh,'担当者ID',id);if(r<0)throw'担当者IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,CONTACT_HEADERS),data);rec['担当者ID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,CONTACT_HEADERS.length).setValues([CONTACT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteContact_(id,secret){ return softDeleteById_(SHEET_CONTACTS,'担当者ID',id,secret); }

// ===== 作業員 =====
function listWorkers_(){ return readAll_(SHEET_WORKERS,WORKER_HEADERS,'作業員ID'); }
function listOwnWorkers_(){ return listWorkers_().filter(function(w){return w['区分']!=='協力会社';}); }
function uid_(prefix){ return prefix+Date.now().toString(36)+Math.floor(Math.random()*1679616).toString(36); }
/* 既存の重複・空IDを一意IDに修復（作業員・取引先・先方担当者）。重複した行だけ振り直し、ユニークなIDはそのまま残す。
 * 編集→デプロイ後にエディタからこの repairIds を1回実行してください。 */
function repairIds(){ var ss=SpreadsheetApp.getActiveSpreadsheet(),rep=[];
  [[SHEET_WORKERS,'作業員ID','W'],[SHEET_CUSTOMERS,'顧客ID','C'],[SHEET_CONTACTS,'担当者ID','K']].forEach(function(t){
    var sh=ss.getSheetByName(t[0]); if(!sh)return; var last=sh.getLastRow(); if(last<2){rep.push(t[0]+':0');return;}
    var hs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],col=hs.indexOf(t[1])+1; if(col<1){rep.push(t[0]+':列なし');return;}
    var vals=sh.getRange(2,col,last-1,1).getValues(),seen={},changed=0;
    for(var i=0;i<vals.length;i++){ var id=String(vals[i][0]||'').trim();
      if(!id||seen[id]){ id=uid_(t[2]); changed++; } seen[id]=1; vals[i][0]=id; }
    if(changed)sh.getRange(2,col,last-1,1).setValues(vals);
    rep.push(t[0]+'：'+changed+'件修正'); });
  var msg=rep.join(' / '); try{ ss.toast(msg,'ID修復 完了',8); }catch(e){} Logger.log(msg); return msg; }
function addWorker_(data){ var sh=sheet_(SHEET_WORKERS);actualHeaders_(sh,WORKER_HEADERS);var now=new Date(),id=data['作業員ID']||uid_('W');
  data=normalizeWorkerPasswordData_(data||{},{});
  if(!data['権限']) data['権限']=roleLabel_(workerAppRole_(data));
  if(!data['利用状態']) data['利用状態']='有効';
  var rec=merge_(blank_(WORKER_HEADERS),data);rec['作業員ID']=id;rec['登録日時']=now;
  appendObjByActualHeaders_(sh,WORKER_HEADERS,rec);return readObj_(rec); }
function updateWorker_(id,data){ var sh=sheet_(SHEET_WORKERS);actualHeaders_(sh,WORKER_HEADERS);var r=findRow_(sh,'作業員ID',id);if(r<0)throw'作業員IDが見つかりません: '+id;
  var existing=rowToObjByActualHeaders_(sh,r,WORKER_HEADERS);
  data=normalizeWorkerPasswordData_(data||{},existing);
  var rec=merge_(existing,data);rec['作業員ID']=id;
  setObjByActualHeaders_(sh,r,WORKER_HEADERS,rec);return readObj_(rec); }
function deleteWorker_(id,secret){ return softDeleteById_(SHEET_WORKERS,'作業員ID',id,secret); }
function workerRate_(id){ if(!id)return 0; var w=listWorkers_();for(var i=0;i<w.length;i++)if(String(w[i]['作業員ID'])===String(id))return numv_(w[i]['標準単価']);return 0; }

// ===== 作業日報 =====
function listReports_(){ return readAll_(SHEET_REPORTS,REPORT_HEADERS,'日報ID'); }
function addReport_(data){ var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{ var sh=sheet_(SHEET_REPORTS),id=data['日報ID']||newReportId_(),now=new Date();
    var rec=merge_(blank_(REPORT_HEADERS),data);rec['日報ID']=id;
    rec['単価']=workerRate_(rec['作業員ID']); rec['労務費']=numv_(rec['人工'])*numv_(rec['単価']);
    rec['登録日時']=now;rec['更新日時']=now;
    sh.appendRow(REPORT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec);
  }finally{lock.releaseLock();} }
// 複数作業員分の日報を一度に作成（共通項目＋作業員ごとに1行）
function addReportMulti_(data){ var lock=LockService.getScriptLock();lock.waitLock(30000);
  try{ var sh=sheet_(SHEET_REPORTS),now=new Date();
    var ws=(data&&data['_workers'])||[];
    var common={}; REPORT_HEADERS.forEach(function(h){ if(h!=='_workers'&&data[h]!==undefined)common[h]=data[h]; });
    var ids=listReports_().map(function(o){return String(o['日報ID']||'');}),max=0;
    ids.forEach(function(s){var m=s.match(/^R(\d+)$/);if(m)max=Math.max(max,parseInt(m[1],10));});
    var out=[];
    ws.forEach(function(w){ max++; var id='R'+('00000'+max).slice(-5);
      var rec=merge_(blank_(REPORT_HEADERS),common); rec['日報ID']=id;
      rec['作業員ID']=String(w['作業員ID']||''); rec['氏名']=w['氏名']||''; rec['区分']=w['区分']||''; rec['所属']=w['所属']||'';
      rec['単価']=workerRate_(rec['作業員ID']); rec['労務費']=numv_(rec['人工'])*numv_(rec['単価']);
      rec['登録日時']=now; rec['更新日時']=now;
      sh.appendRow(REPORT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
      out.push(readObj_(rec));
    });
    return out;
  }finally{lock.releaseLock();} }
function updateReport_(id,data){ var sh=sheet_(SHEET_REPORTS),r=findRow_(sh,'日報ID',id);if(r<0)throw'日報IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,REPORT_HEADERS),data);rec['日報ID']=id;
  rec['単価']=workerRate_(rec['作業員ID']); rec['労務費']=numv_(rec['人工'])*numv_(rec['単価']); rec['更新日時']=new Date();
  sh.getRange(r,1,1,REPORT_HEADERS.length).setValues([REPORT_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteReport_(id,secret){ return softDeleteById_(SHEET_REPORTS,'日報ID',id,secret); }
function newReportId_(){ var ids=listReports_().map(function(o){return String(o['日報ID']||'');}),max=0;
  ids.forEach(function(s){var m=s.match(/^R(\d+)$/);if(m)max=Math.max(max,parseInt(m[1],10));});return'R'+('00000'+(max+1)).slice(-5); }

// ===== スケジュール =====
function listSchedules_(){ return readAll_(SHEET_SCHEDULE,SCHEDULE_HEADERS,'予定ID'); }
function addSchedule_(data){ var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{ var sh=sheet_(SHEET_SCHEDULE),id=data['予定ID']||newScheduleId_(),now=new Date();
    var rec=merge_(blank_(SCHEDULE_HEADERS),data);rec['予定ID']=id;rec['登録日時']=now;rec['更新日時']=now;
    sh.appendRow(SCHEDULE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec);
  }finally{lock.releaseLock();} }
function updateSchedule_(id,data){ var sh=sheet_(SHEET_SCHEDULE),r=findRow_(sh,'予定ID',id);if(r<0)throw'予定IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,SCHEDULE_HEADERS),data);rec['予定ID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,SCHEDULE_HEADERS.length).setValues([SCHEDULE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteSchedule_(id,secret){ return softDeleteById_(SHEET_SCHEDULE,'予定ID',id,secret); }
function newScheduleId_(){ var ids=listSchedules_().map(function(o){return String(o['予定ID']||'');}),max=0;
  ids.forEach(function(s){var m=s.match(/^S(\d+)$/);if(m)max=Math.max(max,parseInt(m[1],10));});return'S'+('00000'+(max+1)).slice(-5); }

// ===== 勤怠（タイムカード）=====
function listKintai_(){ return readAll_(SHEET_KINTAI,KINTAI_HEADERS,'勤怠ID'); }
function kintaiByDate_(date){ date=String(date||'').slice(0,10); return listKintai_().filter(function(k){return String(k['日付']||'').slice(0,10)===date;}); }
// 当日分（出勤日=今日）＋ 未退勤の勤務（夜勤の継続中など、日付を問わず）を返す
function kintaiForToday_(date){ date=String(date||'').slice(0,10); return listKintai_().filter(function(k){
  var d=String(k['日付']||'').slice(0,10), hasIn=(k['出勤']!==''&&k['出勤']!=null), hasOut=(k['退勤']!==''&&k['退勤']!=null);
  return d===date || (hasIn&&!hasOut); }); }
function kintaiByMonth_(ym){ ym=String(ym||'').slice(0,7); return listKintai_().filter(function(k){return String(k['日付']||'').slice(0,7)===ym;})
  .sort(function(a,b){return (String(a['日付'])+a['氏名']).localeCompare(String(b['日付'])+b['氏名']);}); }
function toMin_(t){ var m=String(t||'').match(/(\d{1,2}):(\d{2})/); return m?(+m[1]*60+ +m[2]):null; }
function calcWork_(inT,outT,brk){ var a=toMin_(inT),b=toMin_(outT); if(a==null||b==null)return ''; if(b<a)b+=1440; var w=b-a-numv_(brk); return Math.round(Math.max(0,w)/60*100)/100; }
// 1行＝1勤務（出勤→退勤のペア）。出勤=新規行を作成、退勤=未退勤の最新行を閉じる。
function punch_(d){
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var sh=sheet_(SHEET_KINTAI), wid=String(d['作業員ID']||''), type=d['種別'], t=String(d['時刻']||'');
    if(!wid) throw '作業員IDが必要です';
    var last=sh.getLastRow();
    var rows = last>=2 ? sh.getRange(2,1,last-1,KINTAI_HEADERS.length).getValues() : [];
    // この作業員の「未退勤（出勤あり・退勤なし）」の最新行を探す
    var openIdx=-1, openObj=null;
    for(var i=0;i<rows.length;i++){ var o={}; KINTAI_HEADERS.forEach(function(h,k){o[h]=rows[i][k];});
      if(String(o['作業員ID'])!==wid) continue;
      var hasIn=(o['出勤']!==''&&o['出勤']!=null), hasOut=(o['退勤']!==''&&o['退勤']!=null);
      if(hasIn&&!hasOut){ openIdx=i+2; openObj=o; } }
    var now=new Date(), tz=Session.getScriptTimeZone();
    if(type==='出勤'){
      if(openIdx>0) throw 'すでに出勤中です。先に退勤してください';
      var rec=blank_(KINTAI_HEADERS);
      rec['勤怠ID']=newKintaiId_();
      rec['日付']=(String(d['日付']||'').slice(0,10))||Utilities.formatDate(now,tz,'yyyy-MM-dd');
      rec['作業員ID']=wid; if(d['氏名'])rec['氏名']=d['氏名'];
      rec['出勤']=t; if(d['位置'])rec['出勤位置']=d['位置'];
      if(d['現場ID']!==undefined){rec['現場ID']=d['現場ID'];rec['現場名']=d['現場名']||'';}
      if(d['休憩分']!==undefined&&d['休憩分']!=='') rec['休憩分']=d['休憩分'];
      rec['実働時間']=''; rec['登録日時']=now; rec['更新日時']=now;
      sh.appendRow(KINTAI_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
      try{ updateBookForWorker_(wid); }catch(e){}   // 出勤簿ファイルにも反映（失敗しても打刻は成立）
      return readObj_(rec);
    } else if(type==='退勤'){
      if(openIdx<0) throw '出勤の記録がありません。先に出勤してください';
      var rec=openObj;
      rec['退勤']=t; if(d['位置'])rec['退勤位置']=d['位置'];
      if(d['休憩分']!==undefined&&d['休憩分']!=='') rec['休憩分']=d['休憩分'];
      rec['実働時間']=calcWork_(fmt_(rec['出勤']),t,rec['休憩分']);
      rec['更新日時']=now;
      sh.getRange(openIdx,1,1,KINTAI_HEADERS.length).setValues([KINTAI_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
      try{ updateBookForWorker_(wid); }catch(e){}   // 出勤簿ファイルにも反映（失敗しても打刻は成立）
      return readObj_(rec);
    } else { throw '種別が不正です'; }
  }finally{lock.releaseLock();}
}
function updateKintai_(id,data){ var sh=sheet_(SHEET_KINTAI),r=findRow_(sh,'勤怠ID',id);if(r<0)throw'勤怠IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,KINTAI_HEADERS),data);rec['勤怠ID']=id;
  rec['実働時間']=calcWork_(rec['出勤'],rec['退勤'],rec['休憩分']); rec['更新日時']=new Date();
  sh.getRange(r,1,1,KINTAI_HEADERS.length).setValues([KINTAI_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
  try{ updateBookForWorker_(rec['作業員ID']); }catch(e){}
  return readObj_(rec); }
function deleteKintai_(id,secret){ var sh=sheet_(SHEET_KINTAI),r=findRow_(sh,'勤怠ID',id);if(r<0)return false;
  var wid=String(rowToObj_(sh,r,KINTAI_HEADERS)['作業員ID']||''); var ok=softDeleteById_(SHEET_KINTAI,'勤怠ID',id,secret);
  try{ updateBookForWorker_(wid); }catch(e){} return ok; }
// 手入力で1勤務を追加（日付・出勤・退勤・休憩を指定。出退勤がそろえば実働を計算）
function kintaiAdd_(d){
  var lock=LockService.getScriptLock(); lock.waitLock(20000);
  try{
    var sh=sheet_(SHEET_KINTAI), wid=String(d['作業員ID']||''), date=String(d['日付']||'').slice(0,10);
    if(!wid||!date) throw '作業員と日付が必要です';
    var rec=blank_(KINTAI_HEADERS); rec['勤怠ID']=newKintaiId_(); rec['日付']=date; rec['作業員ID']=wid; if(d['氏名'])rec['氏名']=d['氏名'];
    rec['出勤']=String(d['出勤']||''); rec['退勤']=String(d['退勤']||'');
    rec['休憩分']=(d['休憩分']!==undefined&&d['休憩分']!=='')?d['休憩分']:0;
    rec['実働時間']=calcWork_(rec['出勤'],rec['退勤'],rec['休憩分']);
    rec['備考']=String(d['備考']||'手入力'); var now=new Date(); rec['登録日時']=now; rec['更新日時']=now;
    sh.appendRow(KINTAI_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
    try{ updateBookForWorker_(wid); }catch(e){}
    return readObj_(rec);
  } finally{ lock.releaseLock(); }
}
// 本人の記録だけ削除（作業員IDが一致する場合のみ）
function kintaiDeleteOwn_(id, wid, secret){
  var sh=sheet_(SHEET_KINTAI), r=findRow_(sh,'勤怠ID',id); if(r<0) return false;
  var obj=rowToObj_(sh,r,KINTAI_HEADERS);
  if(wid && String(obj['作業員ID'])!==String(wid)) throw '他の人の記録は削除できません';
  var ok=softDeleteById_(SHEET_KINTAI,'勤怠ID',id,secret); try{ updateBookForWorker_(wid||obj['作業員ID']); }catch(e){} return ok;
}
function newKintaiId_(){ var ids=listKintai_().map(function(o){return String(o['勤怠ID']||'');}),max=0;
  ids.forEach(function(s){var m=s.match(/^K(\d+)$/);if(m)max=Math.max(max,parseInt(m[1],10));});return'K'+('00000'+(max+1)).slice(-5); }
// 締日など期間指定で勤怠を取得（from〜to を含む）
function kintaiRange_(from,to){ from=String(from||'').slice(0,10); to=String(to||'').slice(0,10);
  return listKintai_().filter(function(k){var d=String(k['日付']||'').slice(0,10); return d&&d>=from&&d<=to;})
    .sort(function(a,b){return (String(a['日付'])+(a['氏名']||'')).localeCompare(String(b['日付'])+(b['氏名']||''));}); }
// 勤怠の計算ルール（設定シート：キー／値）。未設定キーは既定値で補完
function getSettings_(){ var sh=sheet_(SHEET_SETTINGS),last=sh.getLastRow(),o={};
  for(var k in SETTINGS_DEFAULT){ if(SETTINGS_DEFAULT.hasOwnProperty(k))o[k]=SETTINGS_DEFAULT[k]; }
  if(last>=2){ var rows=sh.getRange(2,1,last-1,2).getValues();
    for(var i=0;i<rows.length;i++){ var key=String(rows[i][0]||'').trim(); if(!key)continue;
      var val=rows[i][1]; o[key]=fmt_(val); } }  // fmt_()でDate→'HH:mm'に変換
  return o; }
function saveSettings_(data){ var sh=sheet_(SHEET_SETTINGS),last=sh.getLastRow(),map={};
  if(last>=2){ var keys=sh.getRange(2,1,last-1,1).getValues();
    for(var i=0;i<keys.length;i++){ var k=String(keys[i][0]||'').trim(); if(k)map[k]=i+2; } }
  for(var key in data){ if(!data.hasOwnProperty(key))continue; var val=String(data[key]==null?'':data[key]);
    if(map[key]) sh.getRange(map[key],2).setValue(val); else sh.appendRow([String(key),val]); }
  return getSettings_(); }
// 祝日（内閣府の公開CSV：Shift_JIS）。全件を6時間キャッシュし、from〜toで返す
function getHolidays_(from,to){ from=String(from||'').slice(0,10); to=String(to||'').slice(0,10);
  var cache=null; try{cache=CacheService.getScriptCache();}catch(e){}
  var map=null, cached=cache?cache.get('jp_holidays'):null;
  if(cached){ try{map=JSON.parse(cached);}catch(e){map=null;} }
  if(!map){ map={};
    var urls=['https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv','https://www8.cao.go.jp/chosei/shukujitsu/shukujitsu.csv'];
    for(var u=0;u<urls.length;u++){
      try{ var res=UrlFetchApp.fetch(urls[u],{muteHttpExceptions:true,followRedirects:true});
        if(res.getResponseCode()===200){ var txt=res.getBlob().getDataAsString('Shift_JIS'); var rows=Utilities.parseCsv(txt);
          for(var i=1;i<rows.length;i++){ var r=rows[i]; if(!r||!r[0])continue;
            var m=String(r[0]).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/); if(!m)continue;
            var key=m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2); map[key]=String(r[1]||'祝日').trim(); }
          if(Object.keys(map).length){ if(cache)cache.put('jp_holidays',JSON.stringify(map),21600); break; } }
      }catch(e){} } }
  var out={}; for(var k in map){ if(map.hasOwnProperty(k)&&(!from||k>=from)&&(!to||k<=to))out[k]=map[k]; }
  return out; }

/* ===== 申請・承認ワークフロー ===== */
function listApplications_(){ return readAll_(SHEET_APPLICATIONS,APPLICATION_HEADERS,'申請ID'); }
function newAppId_(){ var ids=listApplications_().map(function(o){return String(o['申請ID']||'');}),max=0;
  ids.forEach(function(s){var m=s.match(/^A(\d+)$/);if(m)max=Math.max(max,parseInt(m[1],10));});return'A'+('00000'+(max+1)).slice(-5); }
function applicationsByWorker_(wid){ wid=String(wid||''); return listApplications_().filter(function(a){return String(a['作業員ID'])===wid;})
  .sort(function(a,b){return String(b['申請日時']).localeCompare(String(a['申請日時']));}); }
function applicationsPending_(){ return listApplications_().filter(function(a){return String(a['状態'])==='申請中';})
  .sort(function(a,b){return String(a['申請日時']).localeCompare(String(b['申請日時']));}); }
function applicationAdd_(d){ var lock=LockService.getScriptLock(); lock.waitLock(20000);
  try{ var sh=sheet_(SHEET_APPLICATIONS), wid=String(d['作業員ID']||''); if(!wid) throw '作業員IDが必要です';
    var type=String(d['種別']||''); if(!type) throw '種別を選んでください';
    var rec=blank_(APPLICATION_HEADERS); rec['申請ID']=newAppId_(); rec['申請日時']=new Date();
    rec['作業員ID']=wid; rec['氏名']=String(d['氏名']||''); rec['種別']=type;
    rec['対象日']=String(d['対象日']||'').slice(0,10); rec['詳細']=String(d['詳細']||'');
    rec['修正_出勤']=String(d['修正_出勤']||''); rec['修正_退勤']=String(d['修正_退勤']||'');
    rec['修正_休憩分']=(d['修正_休憩分']!==undefined&&d['修正_休憩分']!=='')?d['修正_休憩分']:'';
    rec['状態']='申請中'; rec['処理日時']='';
    sh.appendRow(APPLICATION_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
    return readObj_(rec);
  } finally{ lock.releaseLock(); } }
function applicationCancelOwn_(id,wid,secret){ var sh=sheet_(SHEET_APPLICATIONS), r=findRow_(sh,'申請ID',id); if(r<0) return false;
  var app=rowToObj_(sh,r,APPLICATION_HEADERS);
  if(wid && String(app['作業員ID'])!==String(wid)) throw '他の人の申請は取り消せません';
  if(String(app['状態'])!=='申請中') throw '処理済みの申請は取り消せません';
  return softDeleteById_(SHEET_APPLICATIONS,'申請ID',id,secret); }
function applicationDecide_(id,decision){ var lock=LockService.getScriptLock(); lock.waitLock(20000);
  try{ var sh=sheet_(SHEET_APPLICATIONS), r=findRow_(sh,'申請ID',id); if(r<0) throw '申請が見つかりません: '+id;
    var app=rowToObj_(sh,r,APPLICATION_HEADERS);
    if(String(app['状態'])!=='申請中') throw 'この申請はすでに処理済みです';
    var dec=(decision==='承認')?'承認':'却下', applied=null;
    if(dec==='承認'){ var ty=String(app['種別']);
      if(ty==='打刻修正') applied=applyPunchFix_(app);
      else if(ty==='有給休暇'||ty==='代休') applied=applyLeaveToSchedule_(app);
    }
    app['状態']=dec; app['処理日時']=new Date();
    sh.getRange(r,1,1,APPLICATION_HEADERS.length).setValues([APPLICATION_HEADERS.map(function(h){return app[h]!==undefined?app[h]:'';})]);
    return {app:readObj_(app), result:applied};
  } finally{ lock.releaseLock(); } }
// 打刻修正の承認 → 勤怠へ反映（その日の行があれば更新、なければ作成）
function applyPunchFix_(app){
  var wid=String(app['作業員ID']||''), date=String(app['対象日']||'').slice(0,10); if(!wid||!date) return null;
  var inT=String(app['修正_出勤']||''), outT=String(app['修正_退勤']||'');
  var brk=(app['修正_休憩分']!==undefined&&app['修正_休憩分']!=='')?app['修正_休憩分']:0;
  var sh=sheet_(SHEET_KINTAI), last=sh.getLastRow(), foundRow=-1;
  if(last>=2){ var rows=sh.getRange(2,1,last-1,KINTAI_HEADERS.length).getValues();
    for(var i=0;i<rows.length;i++){ var o={}; KINTAI_HEADERS.forEach(function(h,k){o[h]=rows[i][k];});
      if(String(o['作業員ID'])===wid && String(o['日付']).slice(0,10)===date){ foundRow=i+2; break; } } }
  var now=new Date();
  if(foundRow>0){ var rec=rowToObj_(sh,foundRow,KINTAI_HEADERS);
    if(inT)rec['出勤']=inT; if(outT)rec['退勤']=outT; rec['休憩分']=brk;
    rec['実働時間']=calcWork_(rec['出勤'],rec['退勤'],rec['休憩分']); rec['更新日時']=now;
    sh.getRange(foundRow,1,1,KINTAI_HEADERS.length).setValues([KINTAI_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
    try{ updateBookForWorker_(wid); }catch(e){} return readObj_(rec);
  } else {
    var nr=blank_(KINTAI_HEADERS); nr['勤怠ID']=newKintaiId_(); nr['日付']=date; nr['作業員ID']=wid; nr['氏名']=String(app['氏名']||'');
    nr['出勤']=inT; nr['退勤']=outT; nr['休憩分']=brk; nr['実働時間']=calcWork_(inT,outT,brk);
    nr['備考']='打刻修正(申請承認)'; nr['登録日時']=now; nr['更新日時']=now;
    sh.appendRow(KINTAI_HEADERS.map(function(h){return nr[h]!==undefined?nr[h]:'';}));
    try{ updateBookForWorker_(wid); }catch(e){} return readObj_(nr);
  } }
// 有給・代休の承認 → スケジュール（カレンダー）に終日予定として登録
function applyLeaveToSchedule_(app){
  var date=String(app['対象日']||'').slice(0,10); if(!date) return null;
  var type=String(app['種別']||''), wid=String(app['作業員ID']||''), ryaku='';
  try{ var ws=listWorkers_(); for(var i=0;i<ws.length;i++){ if(String(ws[i]['作業員ID'])===wid){ ryaku=String(ws[i]['略称']||ws[i]['氏名']||''); break; } } }catch(e){}
  if(!ryaku)ryaku=String(app['氏名']||'');
  var sh=sheet_(SHEET_SCHEDULE), now=new Date();
  var rec=blank_(SCHEDULE_HEADERS); rec['予定ID']=newScheduleId_(); rec['日付']=date; rec['予定内容']=type; rec['区分']='その他';
  rec['担当']=ryaku; rec['備考']='申請承認'; rec['登録日時']=now; rec['更新日時']=now;
  sh.appendRow(SCHEDULE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
  return readObj_(rec);
}

/* ===== 有給休暇 ===== */
function listLeave_(){ return readAll_(SHEET_LEAVE,LEAVE_HEADERS,'記録ID'); }
function newLeaveId_(){ var ids=listLeave_().map(function(o){return String(o['記録ID']||'');}),max=0;
  ids.forEach(function(s){var m=s.match(/^L(\d+)$/);if(m)max=Math.max(max,parseInt(m[1],10));});return'L'+('00000'+(max+1)).slice(-5); }
// 承認済みの有給休暇（取得＝1件1日として数える）
function approvedLeave_(){ return listApplications_().filter(function(a){return String(a['種別'])==='有給休暇'&&String(a['状態'])==='承認';}); }
function leaveAdd_(d){ var lock=LockService.getScriptLock(); lock.waitLock(20000);
  try{ var sh=sheet_(SHEET_LEAVE), wid=String(d['作業員ID']||''); if(!wid) throw '作業員を選んでください';
    var rec=blank_(LEAVE_HEADERS); rec['記録ID']=newLeaveId_(); rec['作業員ID']=wid; rec['氏名']=String(d['氏名']||'');
    rec['区分']=String(d['区分']||'付与'); rec['日付']=String(d['日付']||'').slice(0,10); rec['日数']=numv_(d['日数']);
    rec['メモ']=String(d['メモ']||''); rec['登録日時']=new Date();
    sh.appendRow(LEAVE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));
    return readObj_(rec);
  } finally{ lock.releaseLock(); } }
function leaveDelete_(id,secret){ return softDeleteById_(SHEET_LEAVE,'記録ID',id,secret); }
// 全員の残数（付与・調整の合計 − 承認済み有給の件数）
function leaveSummary_(){ var workers=listWorkers_(), leave=listLeave_(), used=approvedLeave_(), grantBy={}, usedBy={};
  leave.forEach(function(l){ var w=String(l['作業員ID']); grantBy[w]=(grantBy[w]||0)+numv_(l['日数']); });
  used.forEach(function(a){ var w=String(a['作業員ID']); usedBy[w]=(usedBy[w]||0)+1; });
  return workers.map(function(w){ var id=String(w['作業員ID']), g=grantBy[id]||0, u=usedBy[id]||0;
    return {作業員ID:id, 氏名:String(w['氏名']||((w['氏']||'')+(w['名']||''))), 付与:g, 取得:u, 残:Math.round((g-u)*10)/10}; }); }
// 本人の有給（残数＋付与/調整明細＋取得明細）
function leaveMine_(wid){ wid=String(wid||'');
  var leave=listLeave_().filter(function(l){return String(l['作業員ID'])===wid;});
  var used=approvedLeave_().filter(function(a){return String(a['作業員ID'])===wid;});
  var g=0; leave.forEach(function(l){g+=numv_(l['日数']);}); var u=used.length;
  return {granted:Math.round(g*10)/10, used:u, balance:Math.round((g-u)*10)/10,
    grants:leave.sort(function(a,b){return String(b['日付']).localeCompare(String(a['日付']));}),
    usedList:used.sort(function(a,b){return String(b['対象日']).localeCompare(String(a['対象日']));})}; }

// ===== ドライブ =====
function getParent_(){ var it=DriveApp.getFoldersByName(PARENT_FOLDER_NAME);return it.hasNext()?it.next():DriveApp.createFolder(PARENT_FOLDER_NAME); }
function ensureSub_(folder,name){ var it=folder.getFoldersByName(name);return it.hasNext()?it.next():folder.createFolder(name); }
function extractFolderId_(url){ if(!url)return'';var m=String(url).match(/[-\w]{25,}/);return m?m[0]:''; }

function getCaseFolderFast_(id){
  // 閲覧専用の高速取得。DriveフォルダURLが既に保存されている場合は、サブフォルダ確認を省略して即取得します。
  // フォルダURLが無い・壊れている場合のみ従来処理で作成します。
  if(!id)throw'案件IDが空です';
  var sh=sheet_(SHEET_PROJECTS),r=findRow_(sh,'案件ID',id);if(r<0)throw'案件IDが見つかりません: '+id;
  var obj=rowToObj_(sh,r,PROJECT_HEADERS),fid=extractFolderId_(obj['Driveフォルダ']);
  if(fid){try{return DriveApp.getFolderById(fid);}catch(e){}}
  return getCaseFolder_(id);
}

function getCaseFolder_(id){ if(!id)throw'案件IDが空です';
  var sh=sheet_(SHEET_PROJECTS),r=findRow_(sh,'案件ID',id);if(r<0)throw'案件IDが見つかりません: '+id;
  var obj=rowToObj_(sh,r,PROJECT_HEADERS),fid=extractFolderId_(obj['Driveフォルダ']),folder=null;
  if(fid){try{folder=DriveApp.getFolderById(fid);}catch(e){folder=null;}}
  if(!folder){ // 種別 → 顧客 → 案件名 の順でフォルダを作成
    var parent=getParent_();
    var kind=String(obj['種別']||'').trim()||'未分類';
    var cust=String(obj['顧客']||'').trim()||'未分類';
    var name=String(obj['案件名']||'').trim()||id;
    var kf=ensureSub_(parent,kind), cf=ensureSub_(kf,cust);
    var it=cf.getFoldersByName(name); folder=it.hasNext()?it.next():cf.createFolder(name);
    setProjectField_(sh,r,'Driveフォルダ',folder.getUrl()); }
  // 現場フォルダの中身：ファイル／図面／書類／写真 の4つ（既にあれば再利用）
  ensureSub_(folder,'ファイル');
  ensureSub_(folder,'図面');
  ensureSub_(folder,'工程表');
  ensureSub_(folder,'書類');
  var photo=ensureSub_(folder,'写真');
  // 写真の中：調査／施工／完了
  ensureSub_(photo,'調査');
  ensureSub_(photo,'施工');
  ensureSub_(photo,'完了');
  return folder; }
function getPhotoFolder_(id){ return ensureSub_(getCaseFolder_(id),'写真'); }
function getFileFolder_(id){ return ensureSub_(getCaseFolder_(id),'ファイル'); }
function setProjectField_(sh,r,header,value){ var hs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],c=hs.indexOf(header)+1;if(c>0)sh.getRange(r,c).setValue(value); }
function listPhotos_(id){
  // 写真フォルダ直下だけでなく、工種別サブフォルダ内の写真も含めて返す。
  var pf=getPhotoFolder_(id),out=[];
  collectPhotos_(pf,out);
  out.sort(function(a,b){return a.name<b.name?1:-1;});
  return out;
}
function uploadPhoto_(p){
  var pf;
  if(p.dest==='file'){ pf=getFileFolder_(p.id); }
  else {
    pf=getPhotoFolder_(p.id);
    var kind=String(p.kind||'').replace(/[\/\\:*?"<>|]/g,'').replace(/^\s+|\s+$/g,'');
    if(kind) pf=ensureSub_(pf,kind);   // 工種ごとのサブフォルダへ振り分け
  }
  var blob=Utilities.newBlob(Utilities.base64Decode(p.data),p.mime||'image/jpeg',p.name||('photo_'+Date.now()+'.jpg'));
  return pf.createFile(blob).getName();
}
function listFiles_(id){ var ff=getFileFolder_(id),it=ff.getFiles(),out=[];while(it.hasNext()){var f=it.next();out.push({name:f.getName(),id:f.getId(),url:f.getUrl()});}out.sort(function(a,b){return a.name<b.name?-1:1;});return out; }

// Google Drive風のフォルダ閲覧用：指定フォルダ直下のフォルダ・ファイルを返す

function driveItemsCachedPayload_(folder){
  var id=folder.getId(), key='driveItems_v110_'+id;
  try{
    var cache=CacheService.getScriptCache(), hit=cache.get(key);
    if(hit){
      var obj=JSON.parse(hit);
      if(obj&&obj.ok!==false)return obj;
    }
  }catch(e){}
  var pay=driveItemsPayload_(folder);
  try{CacheService.getScriptCache().put(key, JSON.stringify(pay), 60);}catch(e){}
  return pay;
}

// Google Drive風のフォルダ閲覧用：指定フォルダ直下のフォルダ・ファイルを返す
function driveItemsPayload_(folder){
  var folders=[], files=[];
  var fo=folder.getFolders();
  while(fo.hasNext() && folders.length<300){
    var d=fo.next();
    folders.push({name:d.getName(), id:d.getId(), url:d.getUrl(), type:'folder'});
  }
  var fi=folder.getFiles();
  while(fi.hasNext() && files.length<500){
    var f=fi.next(), mime='', size=0, updated='';
    try{mime=f.getMimeType()||'';}catch(e){mime='';}
    try{size=f.getSize();}catch(e){size=0;}
    try{updated=String(f.getLastUpdated());}catch(e){updated='';}
    // 閲覧のたびに共有権限を変更すると非常に遅くなるため、ここでは権限変更しません。
    // 画像のサムネイルが出ない場合でも、ファイル名カードとして開ける状態を優先します。
    files.push({name:f.getName(), id:f.getId(), url:f.getUrl(), mime:mime, size:size, updated:updated, type:'file'});
  }
  folders.sort(function(a,b){return String(a.name).localeCompare(String(b.name),'ja');});
  files.sort(function(a,b){return String(a.name).localeCompare(String(b.name),'ja');});
  return {ok:true,folders:folders, files:files};
}

/* ===== v105: 写真・ファイルのアップロード成功確認 =====
   GitHub Pages から GAS へ大容量ファイルを送るため uploadPhoto は no-cors POST のままにし、
   その後 confirmUpload でDrive上に同名ファイルが作成されたかをJSONPで確認します。
*/
function findFilesByNameDeep_(folder, name, out, depth){
  out=out||[]; depth=depth||0;
  if(!folder || !name || depth>8 || out.length>=20) return out;
  try{
    var it=folder.getFilesByName(name);
    while(it.hasNext() && out.length<20){
      var f=it.next();
      out.push({id:f.getId(), name:f.getName(), url:f.getUrl()});
    }
  }catch(e){}
  try{
    var fs=folder.getFolders();
    while(fs.hasNext() && out.length<20){
      findFilesByNameDeep_(fs.next(), name, out, depth+1);
    }
  }catch(e){}
  return out;
}
function confirmUpload_(p){
  var name=String(p.name||'').trim();
  var id=String(p.id||'').trim();
  var dest=String(p.dest||'photo').trim();
  if(!id || !name) return {found:false,error:'案件IDまたはファイル名がありません'};
  var root=(dest==='file')?getFileFolder_(id):getPhotoFolder_(id);
  var files=findFilesByNameDeep_(root,name,[],0);
  return {found:files.length>0, count:files.length, file:files[0]||null};
}


// ===== 共通 =====
function headersFor_(name){ switch(name){
  case SHEET_PROJECTS: return PROJECT_HEADERS; case SHEET_CUSTOMERS: return CUSTOMER_HEADERS;
  case SHEET_WORKERS:  return WORKER_HEADERS;  case SHEET_REPORTS:   return REPORT_HEADERS;
  case SHEET_SCHEDULE: return SCHEDULE_HEADERS; case SHEET_KINTAI:    return KINTAI_HEADERS;
  case SHEET_CONTACTS: return CONTACT_HEADERS;  case SHEET_SETTINGS:  return SETTINGS_HEADERS;
  case SHEET_APPLICATIONS: return APPLICATION_HEADERS;  case SHEET_LEAVE: return LEAVE_HEADERS;
  case SHEET_AUDIT: return AUDIT_HEADERS;
  case SHEET_NOTES: return NOTE_HEADERS;  case SHEET_COSTS: return COST_HEADERS;  case SHEET_DAIKO: return DAIKO_HEADERS;  case SHEET_DOCS: return DOC_HEADERS;
  case SHEET_VEHICLES: return VEHICLE_HEADERS;  case SHEET_EST: return EST_HEADERS;
  case SHEET_TOOLS: return TOOL_HEADERS;  case SHEET_TOOLLEND: return TOOLLEND_HEADERS;
  case SHEET_PRODUCTS: return PRODUCT_HEADERS;  case SHEET_ORDERS: return ORDER_HEADERS;
  case SHEET_STOCKLOG: return STOCKLOG_HEADERS;  default: return null; } }
/* 全データ削除：各シートの見出し行（1行目）は残し、データ行をすべて削除（写真・ファイル等のDriveは対象外）*/
function clearAllData_(){
  var names=[SHEET_PROJECTS,SHEET_CUSTOMERS,SHEET_CONTACTS,SHEET_WORKERS,SHEET_REPORTS,SHEET_SCHEDULE,SHEET_KINTAI];
  var out={};
  names.forEach(function(n){ var sh=sheet_(n),last=sh.getLastRow(),rows=Math.max(0,last-1);
    if(rows>0)sh.deleteRows(2,rows); out[n]=rows; });
  return out;
}

/* ===== v103: 削除データの復元対応（ソフト削除） ===== */
var SOFT_DELETE_COLUMNS=['削除済み','削除日時','削除者ID','削除者名'];
function isDeletedObj_(o){ return String((o&&o['削除済み'])||'').trim()==='1'; }
function ensureSoftDeleteColumns_(sh){
  if(!sh)return;
  var lastCol=Math.max(1,sh.getLastColumn());
  var hs=sh.getRange(1,1,1,lastCol).getValues()[0];
  SOFT_DELETE_COLUMNS.forEach(function(h){
    if(hs.indexOf(h)<0){ lastCol++; sh.getRange(1,lastCol).setValue(h).setFontWeight('bold'); hs.push(h); }
  });
}
function rowToObjActual_(sh,r){
  var lastCol=Math.max(1,sh.getLastColumn());
  var hs=sh.getRange(1,1,1,lastCol).getValues()[0];
  var row=sh.getRange(r,1,1,lastCol).getValues()[0],o={};
  hs.forEach(function(h,i){ if(h)o[h]=fmt_(row[i]); });
  return o;
}
function actorForSoftDelete_(secret){
  var si=sessionInfo_(secret), w=si&&si.worker;
  return {id:w?String(w['作業員ID']||''):'admin', name:w?String(w['氏名']||''):'管理者'};
}
function softDeleteById_(sheetName,idHeader,id,secret){
  var sh=sheet_(sheetName), r=findRow_(sh,idHeader,id); if(r<0)return false;
  ensureSoftDeleteColumns_(sh);
  var hs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var actor=actorForSoftDelete_(secret), vals={};
  vals['削除済み']='1'; vals['削除日時']=new Date(); vals['削除者ID']=actor.id; vals['削除者名']=actor.name;
  Object.keys(vals).forEach(function(k){ var c=hs.indexOf(k)+1; if(c>0)sh.getRange(r,c).setValue(vals[k]); });
  return true;
}
function softDeleteMap_(){
  return {
    'projects':{sheet:SHEET_PROJECTS,id:'案件ID',name:'案件名',label:'案件'}, '案件':{sheet:SHEET_PROJECTS,id:'案件ID',name:'案件名',label:'案件'},
    'customers':{sheet:SHEET_CUSTOMERS,id:'顧客ID',name:'顧客名',label:'取引先'}, '取引先':{sheet:SHEET_CUSTOMERS,id:'顧客ID',name:'顧客名',label:'取引先'},
    'contacts':{sheet:SHEET_CONTACTS,id:'担当者ID',name:'担当者名',label:'先方担当者'}, '担当者':{sheet:SHEET_CONTACTS,id:'担当者ID',name:'担当者名',label:'先方担当者'},
    'workers':{sheet:SHEET_WORKERS,id:'作業員ID',name:'氏名',label:'作業員'}, '作業員':{sheet:SHEET_WORKERS,id:'作業員ID',name:'氏名',label:'作業員'},
    'reports':{sheet:SHEET_REPORTS,id:'日報ID',name:'案件名',label:'日報'}, '日報':{sheet:SHEET_REPORTS,id:'日報ID',name:'案件名',label:'日報'},
    'schedules':{sheet:SHEET_SCHEDULE,id:'予定ID',name:'案件名',label:'予定'}, '予定':{sheet:SHEET_SCHEDULE,id:'予定ID',name:'案件名',label:'予定'},
    'kintai':{sheet:SHEET_KINTAI,id:'勤怠ID',name:'氏名',label:'勤怠'}, '勤怠':{sheet:SHEET_KINTAI,id:'勤怠ID',name:'氏名',label:'勤怠'},
    'applications':{sheet:SHEET_APPLICATIONS,id:'申請ID',name:'氏名',label:'申請'}, '申請':{sheet:SHEET_APPLICATIONS,id:'申請ID',name:'氏名',label:'申請'},
    'leave':{sheet:SHEET_LEAVE,id:'記録ID',name:'氏名',label:'有給'}, '有給':{sheet:SHEET_LEAVE,id:'記録ID',name:'氏名',label:'有給'},
    'notes':{sheet:SHEET_NOTES,id:'メモID',name:'タイトル',label:'現場メモ'}, 'メモ':{sheet:SHEET_NOTES,id:'メモID',name:'タイトル',label:'現場メモ'},
    'costs':{sheet:SHEET_COSTS,id:'原価ID',name:'内容',label:'原価'}, '原価':{sheet:SHEET_COSTS,id:'原価ID',name:'内容',label:'原価'},
    'vehicles':{sheet:SHEET_VEHICLES,id:'車両ID',name:'車両名',label:'車両'}, '車両':{sheet:SHEET_VEHICLES,id:'車両ID',name:'車両名',label:'車両'},
    'suppliers':{sheet:SHEET_SUPPLIERS,id:'仕入先ID',name:'仕入先名',label:'仕入先'}, '仕入先':{sheet:SHEET_SUPPLIERS,id:'仕入先ID',name:'仕入先名',label:'仕入先'},
    'products':{sheet:SHEET_PRODUCTS,id:'商品ID',name:'商品名',label:'商品'}, '商品':{sheet:SHEET_PRODUCTS,id:'商品ID',name:'商品名',label:'商品'},
    'orders':{sheet:SHEET_ORDERS,id:'発注ID',name:'件名',label:'発注'}, '発注':{sheet:SHEET_ORDERS,id:'発注ID',name:'件名',label:'発注'},
    'estimates':{sheet:SHEET_EST,id:'伝票ID',name:'件名',label:'見積請求'}, '見積請求':{sheet:SHEET_EST,id:'伝票ID',name:'件名',label:'見積請求'},
    'tools':{sheet:SHEET_TOOLS,id:'道具ID',name:'道具名',label:'道具'}, '道具':{sheet:SHEET_TOOLS,id:'道具ID',name:'道具名',label:'道具'}
  };
}
function listDeletedRows_(key){
  var map=softDeleteMap_(), keys=String(key||'').trim()?[String(key||'').trim()]:['projects','customers','contacts','workers','reports','schedules','kintai','applications','leave','notes','costs','vehicles','suppliers','products','orders','estimates','tools'];
  var out=[];
  keys.forEach(function(k){ var t=map[k]; if(!t)return; var sh=sheet_(t.sheet), last=sh.getLastRow(); if(last<2)return; var lastCol=Math.max(1,sh.getLastColumn()), hs=sh.getRange(1,1,1,lastCol).getValues()[0]; if(hs.indexOf('削除済み')<0)return; var rows=sh.getRange(2,1,last-1,lastCol).getValues();
    rows.forEach(function(row,i){ var o={}; hs.forEach(function(h,j){ if(h)o[h]=fmt_(row[j]); }); if(isDeletedObj_(o)){ out.push({種別:t.label, sheetKey:k, シート名:t.sheet, ID:o[t.id]||'', 名称:o[t.name]||'', 削除日時:o['削除日時']||'', 削除者名:o['削除者名']||'', row:i+2}); } });
  });
  out.sort(function(a,b){ return String(b['削除日時']||'').localeCompare(String(a['削除日時']||'')); });
  return out;
}
function restoreDeletedRow_(key,id){
  var t=softDeleteMap_()[String(key||'').trim()]; if(!t)throw '復元対象の種類が不正です: '+key;
  var sh=sheet_(t.sheet), r=findRow_(sh,t.id,id); if(r<0)return false;
  ensureSoftDeleteColumns_(sh);
  var hs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  SOFT_DELETE_COLUMNS.forEach(function(h){ var c=hs.indexOf(h)+1; if(c>0)sh.getRange(r,c).clearContent(); });
  return true;
}

function sheet_(name){ var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(name);
  if(!sh){ sh=ss.insertSheet(name); var hs=headersFor_(name);
    if(hs){ sh.getRange(1,1,1,hs.length).setValues([hs]).setFontWeight('bold'); sh.setFrozenRows(1); } }
  return sh; }
function readAll_(name,headers,keyCol){ var sh=sheet_(name),last=sh.getLastRow();if(last<2)return[];
  var lastCol=Math.max(1,sh.getLastColumn());
  var actual=sh.getRange(1,1,1,lastCol).getValues()[0];
  return sh.getRange(2,1,last-1,lastCol).getValues().map(function(row){var o={};
    headers.forEach(function(h,i){var idx=actual.indexOf(h); o[h]=fmt_(idx>=0?row[idx]:row[i]);});
    actual.forEach(function(h,i){ if(h && o[h]===undefined)o[h]=fmt_(row[i]); });
    return o;
  }).filter(function(o){return String(o[keyCol]||'')!=='' && !isDeletedObj_(o);}); }
function rowToObj_(sh,r,headers){ var row=sh.getRange(r,1,1,headers.length).getValues()[0],o={};headers.forEach(function(h,i){o[h]=fmt_(row[i]);});return o; }
function findRow_(sh,header,value){ var hs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],col=hs.indexOf(header)+1;if(col<1)return-1;var last=sh.getLastRow();if(last<2)return-1;
  var vals=sh.getRange(2,col,last-1,1).getValues();for(var i=0;i<vals.length;i++)if(String(vals[i][0])===String(value))return i+2;return-1; }
function blank_(headers){ var o={};headers.forEach(function(h){o[h]='';});return o; }
function merge_(a,b){ var o={};for(var k in a)o[k]=a[k];for(var k2 in b)if(b[k2]!==undefined)o[k2]=b[k2];return o; }
function readObj_(rec){ var o={};for(var k in rec)o[k]=fmt_(rec[k]);return o; }
function numv_(v){ var n=parseFloat(String(v).replace(/[^\d.-]/g,''));return isNaN(n)?0:n; }
function fmt_(v){ if(v instanceof Date){var tz=Session.getScriptTimeZone();
  if(v.getFullYear()<1900) return Utilities.formatDate(v,tz,'HH:mm');   // 時刻のみの値（シート基準日1899-12-30）は時刻だけ返す
  var t=v.getHours()||v.getMinutes()||v.getSeconds();return Utilities.formatDate(v,tz,t?'yyyy-MM-dd HH:mm':'yyyy-MM-dd');}return v; }
function json_(obj,cb){ var s=JSON.stringify(obj);if(cb)return ContentService.createTextOutput(cb+'('+s+')').setMimeType(ContentService.MimeType.JAVASCRIPT);return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }

// ===== 出勤簿（別ファイル：社員ごと1シート）=====
// 「現場管理DB」とは別の Google スプレッドシート（＝出勤簿ファイル）に、社員ごと1シートで出力します。
// ・初回：メニュー「▶勤怠 → 出勤簿ファイルを更新（全員）」を1回実行すると出勤簿ファイルが作られます。
// ・以後：打刻のたびに、その社員のシートが自動で最新化されます（開けば最新）。
// ・全員を一括で作り直すのも上記メニュー。URLは「出勤簿ファイルを開く」で確認できます。
// ★出勤簿ファイルは自動生成です。手で編集しても次回更新時に上書きされます。元データは「勤怠」シート。
var BOOK_FILE_NAME='出勤簿（河口電機）';
function bookProps_(){ return PropertiesService.getScriptProperties(); }
function getBookSS_(){
  var pid=bookProps_().getProperty('BOOK_SS_ID');
  if(pid){ try{ return SpreadsheetApp.openById(pid); }catch(e){} }   // ファイルが消えていたら作り直す
  var ss=SpreadsheetApp.create(BOOK_FILE_NAME); bookProps_().setProperty('BOOK_SS_ID', ss.getId()); return ss;
}
function onOpen(){
  try{ var ui=SpreadsheetApp.getUi();
    ui.createMenu('▶セットアップ')
      .addItem('初期設定を実行（最初に1回）','menuSetupGenba')
      .addItem('現在の設定を確認','menuShowConfig')
      .addToUi();
    ui.createMenu('▶勤怠')
      .addItem('出勤簿ファイルを更新（全員）','menuRebuildBookFile')
      .addItem('出勤簿ファイルを開く（URL表示）','menuOpenBookFile')
      .addToUi();
    ui.createMenu('▶バックアップ')
      .addItem('今すぐバックアップを作成','menuBackupNow')
      .addItem('自動バックアップを設定（毎日）','menuBackupEnable')
      .addItem('自動バックアップの状態を確認','menuBackupStatus')
      .addItem('自動バックアップを停止','menuBackupDisable')
      .addItem('バックアップ一覧を開く（URL表示）','menuBackupOpen')
      .addItem('オフラインビュワーを書き出す','menuOfflineExport')
      .addToUi();
  }catch(e){}
}
function menuRebuildBookFile(){ var r=rebuildBookFile_();
  try{ SpreadsheetApp.getUi().alert('出勤簿ファイルを更新しました（'+r.n+'名）。\n\n下のURLを開いてください（ブックマーク推奨）：\n'+r.url); }catch(e){} }
function menuOpenBookFile(){ var ss=getBookSS_();
  try{ SpreadsheetApp.getUi().alert('出勤簿ファイルのURL：\n\n'+ss.getUrl()); }catch(e){} }

function rebuildBookFile_(){
  var book=getBookSS_();
  var ws=listWorkers_(); ws.sort(function(a,b){return (numv_(a['表示順'])||9999)-(numv_(b['表示順'])||9999);});
  var all=listKintai_(), keep={};
  for(var i=0;i<ws.length;i++){ keep[buildBookSheet_(book, ws[i], all)]=true; }
  cleanupBookSheets_(book, keep);
  return {url:book.getUrl(), n:ws.length};
}
function updateBookForWorker_(wid){
  var pid=bookProps_().getProperty('BOOK_SS_ID'); if(!pid) return;   // 出勤簿ファイル未作成なら何もしない
  var book; try{ book=SpreadsheetApp.openById(pid); }catch(e){ return; }
  var w=listWorkers_().filter(function(x){return String(x['作業員ID'])===String(wid);})[0]; if(!w) return;
  buildBookSheet_(book, w, listKintai_());
}
function cleanupBookSheets_(book, keep){
  var sheets=book.getSheets(), del=[];
  for(var i=0;i<sheets.length;i++){ if(!keep[sheets[i].getName()]) del.push(sheets[i]); }   // 社員シート以外（既定のシート1・空タブ・改名前の古いタブ等）
  for(var j=0;j<del.length;j++){ if(book.getSheets().length<=1) break; try{ book.deleteSheet(del[j]); }catch(e){} }   // 最低1シートは残す
}
function bookSheetName_(w){ var nm=String(w['氏名']||'').replace(/[:\\\/\?\*\[\]]/g,' ').trim(); if(!nm)nm=String(w['作業員ID']||'?'); return nm.slice(0,95); }

function isRestDay_(y,mo,day){ var d=new Date(y,mo-1,day).getDay(); return d===0||d===6; }  // 土日を休日扱い（祝日は含めない）
function minToHM_(min){ min=Math.round(min); if(min<0)min=0; var h=Math.floor(min/60), m=min%60; return h+':'+('0'+m).slice(-2); }
function overlapNight_(a,b){ var W=[[0,300],[1320,1440],[1440,1740],[2760,2880]],t=0;   // 深夜=22:00〜翌5:00
  for(var i=0;i<W.length;i++){ var s=Math.max(a,W[i][0]), e=Math.min(b,W[i][1]); if(e>s)t+=e-s; } return t; }
// 緯度経度→住所（逆ジオコーディング）。同じ地点はScriptPropertiesにキャッシュして繰り返し検索を防ぐ。
function cleanAddr_(a){ return String(a||'').replace(/^日本[、,]?\s*/,'').replace(/^〒?\s*\d{3}-?\d{4}\s*/,'').trim(); }  // 「日本、」と郵便番号を除去
function getAddress_(latlng){ latlng=String(latlng||'').trim(); if(!latlng)return '';
  var m=latlng.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/); if(!m)return '';
  var key='GEO_'+m[1].replace('.','_').slice(0,12)+'_'+m[2].replace('.','_').slice(0,12);
  var p=bookProps_(); var c=null; try{ c=p.getProperty(key); }catch(e){}
  if(c!=null) return cleanAddr_(c);   // 既存キャッシュにも整形を適用（郵便番号を消す）
  var addr=''; try{ var g=Maps.newGeocoder().setLanguage('ja').reverseGeocode(parseFloat(m[1]),parseFloat(m[2]));
    if(g&&g.results&&g.results.length){ addr=String(g.results[0].formatted_address||''); } }catch(e){ addr=''; }
  try{ p.setProperty(key, addr); }catch(e){} return cleanAddr_(addr); }
// 位置セル＝Googleマップへのリンク（表示は住所、なければ座標）
function mapsCell_(latlng){ latlng=String(latlng||'').trim(); if(!latlng)return '';
  var m=latlng.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/); if(!m)return '';
  var url='https://www.google.com/maps?q='+m[1]+','+m[2];
  var label=(getAddress_(latlng)||latlng).replace(/"/g,'""'); return '=HYPERLINK("'+url+'","'+label+'")'; }

// 月次タイムシート（社員ごと1シートに、月ブロックを新しい月から縦に並べる）。純粋関数。位置はlocsで返す。
// ★残業/深夜/休日の区分は標準ルールの目安です（所定8h/日・深夜22:00〜5:00・休日=土日）。会社の規定に合わせて要調整。
// ★欠勤/遅刻/早退/有給は打刻からは判定できないため空欄です。
function bookMatrix_(w, rows){
  var wid=String(w['作業員ID']||''), name=String(w['氏名']||''), dept=String(w['所属']||w['区分']||'');
  var YOUBI=['日','月','火','水','木','金','土'];
  var HEAD=['日','勤怠','曜日','出勤時刻','退勤時刻','休憩','勤務時間','普通残業時間','深夜残業時間','休日労働時間','休日深夜労働時間','備考','出勤位置','退勤位置'];
  var C=HEAD.length, values=[], types=[], locs=[];
  function pad(a){ while(a.length<C)a.push(''); return a; }
  function push(row,type,loc){ values.push(pad(row.slice())); types.push(type); locs.push(loc||null); }
  push(['出勤簿　'+name+'（'+wid+'）'],'title');
  var byDay={};
  rows.forEach(function(k){ if(String(k['作業員ID'])!==wid)return; var d=String(k['日付']||'').slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return; (byDay[d]=byDay[d]||[]).push(k); });
  var months={}; Object.keys(byDay).forEach(function(d){months[d.slice(0,7)]=true;});
  var monthKeys=Object.keys(months).sort().reverse();
  if(!monthKeys.length){ push(['（打刻データがありません）'],'empty'); return {values:values,types:types,locs:locs,C:C}; }
  monthKeys.forEach(function(mk,mi){
    var y=+mk.slice(0,4), mo=+mk.slice(5,7);
    if(mi>0) push([''],'blank');
    push([y+'年 '+mo+'月'],'month');
    push(['社員番号',wid,'氏名',name,'所属',dept],'emp');
    var totW=0,totOT=0,totNW=0,totHW=0,totHN=0,cSh=0,cKy=0, dayRows=[], last=new Date(y,mo,0).getDate();
    for(var day=1; day<=last; day++){
      var ds=mk+'-'+('0'+day).slice(-2), dow=YOUBI[new Date(y,mo-1,day).getDay()];
      var list=(byDay[ds]||[]).slice().sort(function(a,b){return String(a['出勤']||'').localeCompare(String(b['出勤']||''));});
      if(!list.length){ dayRows.push({row:[mo+'/'+day,'',dow,'','','','','','','','','','',''], loc:null}); continue; }
      var hasInDay=false, cumWorked=0;   // 1日の所定8h(=480分)を各勤務に順番に配分して普通残業を出す
      for(var si=0; si<list.length; si++){
        var s=list[si], sIn=s['出勤']||'', sOut=s['退勤']||'', sInLoc=s['出勤位置']||'', sOutLoc=s['退勤位置']||'';
        var hasIn=sIn!==''; if(hasIn)hasInDay=true;
        var a=toMin_(sIn), bRaw=toMin_(sOut), sWorked=0, sNight=0, crossed=false, open=(hasIn&&sOut==='');
        if(a!=null&&bRaw!=null){ var b=bRaw; if(b<a){b+=1440;crossed=true;} sWorked=Math.max(0,b-a-numv_(s['休憩分'])); sNight=overlapNight_(a,b); }
        var regBefore=Math.min(cumWorked,480), regAfter=Math.min(cumWorked+sWorked,480), sOT=sWorked-(regAfter-regBefore), sNW=sNight;
        cumWorked+=sWorked;
        totW+=sWorked; totOT+=sOT; totNW+=sNW;
        var note=[]; if(crossed)note.push('夜勤'); if(open)note.push('未退勤');
        dayRows.push({row:[mo+'/'+day,'出勤',dow,sIn,sOut,minToHM_(numv_(s['休憩分'])),
          (sWorked>0?minToHM_(sWorked):''),(sOT>0?minToHM_(sOT):''),(sNW>0?minToHM_(sNW):''),'','',
          note.join('・'),'',''], loc:{in:sInLoc,out:sOutLoc}});
      }
      if(hasInDay)cSh++;
    }
    push(['出勤日数','欠勤日数','遅刻日数','早退日数','休日出勤','有給休暇'],'cnthdr');
    push([cSh,'','','',cKy,''],'cntval');
    push(['勤務時間','普通残業時間','深夜残業時間','休日労働時間','休日深夜労働時間'],'timehdr');
    push([minToHM_(totW),minToHM_(totOT),minToHM_(totNW),minToHM_(totHW),minToHM_(totHN)],'timeval');
    push([''],'blank');
    push(HEAD.slice(),'head');
    dayRows.forEach(function(d){ push(d.row,'day',d.loc); });
  });
  return {values:values, types:types, locs:locs, C:C};
}

function buildBookSheet_(book, w, allKintai){
  var name=bookSheetName_(w);
  var sh=book.getSheetByName(name);
  if(sh){ try{ sh.getRange(1,1,sh.getMaxRows(),3).breakApart(); }catch(e){} sh.clear(); } else { sh=book.insertSheet(name); }
  var m=bookMatrix_(w, allKintai), V=m.values, T=m.types, L=m.locs, C=m.C, R=V.length;
  sh.getRange(1,1,R,12).setNumberFormat('@');     // 1〜12列は文字列（時刻/日付の自動変換を防ぐ）※書き込み前に指定
  sh.getRange(1,1,R,C).setValues(V);
  var loc=[]; for(var i=0;i<R;i++){ loc.push(T[i]==='day'&&L[i] ? [mapsCell_(L[i].in),mapsCell_(L[i].out)] : [V[i][12],V[i][13]]); }
  sh.getRange(1,13,R,2).setValues(loc);            // 出勤位置・退勤位置＝Googleマップへのリンク（住所表示）。日付行以外は見出し等の元の値を保持
  var bg=[],fw=[],fc=[];
  for(var r=0;r<R;r++){ var t=T[r], dark=(t==='head'||t==='cnthdr'||t==='timehdr'), rb='#ffffff', bold=false;
    if(t==='title'){ rb='#2bb6a0'; bold=true; }
    else if(t==='month'){ rb='#d6f1ea'; bold=true; }
    else if(dark){ rb='#374151'; bold=true; }
    else if(t==='cntval'||t==='timeval'){ rb='#f3f7f6'; bold=true; }
    else if(t==='emp'){ rb='#eef2f5'; }
    else if(t==='day'){ var dw=V[r][2]; rb = dw==='日'?'#fdecec':(dw==='土'?'#eaf2fb':'#ffffff'); }
    var BR=[],BF=[],CF=[];
    for(var c=0;c<C;c++){ BR.push(rb); BF.push(bold?'bold':'normal');
      var col=(dark||t==='title')?'#ffffff':'#2b323c';
      if(t==='day'&&c===2){ var d2=V[r][2]; col=d2==='日'?'#dd2222':(d2==='土'?'#2a6fb5':'#2b323c'); }
      CF.push(col); }
    bg.push(BR); fw.push(BF); fc.push(CF);
  }
  var rng=sh.getRange(1,1,R,C);
  rng.setBackgrounds(bg); rng.setFontWeights(fw); rng.setFontColors(fc); rng.setVerticalAlignment('middle');
  sh.getRange(1,1,R,12).setHorizontalAlignment('center');
  sh.getRange(1,13,R,2).setHorizontalAlignment('left');
  sh.getRange(1,1).setHorizontalAlignment('left').setFontSize(13);
  for(var r2=0;r2<R;r2++){
    if(T[r2]==='head'){ sh.getRange(r2+1,4,1,2).setBackground('#e2574c');   // 出勤時刻・退勤時刻を赤
      var e=r2; while(e+1<R&&T[e+1]==='day')e++;
      sh.getRange(r2+1,1,e-r2+1,C).setBorder(true,true,true,true,true,true,'#c8ced6',SpreadsheetApp.BorderStyle.SOLID); }
    if(T[r2]==='emp'){ sh.getRange(r2+1,1,5,6).setBorder(true,true,true,true,true,true,'#c8ced6',SpreadsheetApp.BorderStyle.SOLID); }
  }
  // 同じ日に複数行ある場合、日付・勤怠・曜日のセルを縦結合して1つにまとめる
  var rr=0;
  while(rr<R){ if(T[rr]==='day'){ var st=rr, dt=V[rr][0];
      while(rr+1<R && T[rr+1]==='day' && V[rr+1][0]===dt) rr++;
      if(rr-st+1>=2 && dt!=='') sh.getRange(st+1,1,rr-st+1,3).mergeVertically(); rr++;
    } else rr++; }
  var widths=[52,64,40,66,66,54,72,86,86,86,98,90,230,230];
  for(var cw=0;cw<widths.length;cw++) sh.setColumnWidth(cw+1, widths[cw]);
  sh.setFrozenRows(1);
  return name;
}

// ===== 現場メモ・チェックリスト（ツールボックス）=====
function listNotes_(caseId,type){ var all=readAll_(SHEET_NOTES,NOTE_HEADERS,'メモID'); if(caseId)all=all.filter(function(o){return String(o['案件ID'])===String(caseId);}); if(type)all=all.filter(function(o){return String(o['種類']||'memo')===String(type);}); return all; }
function addNote_(data){ var sh=sheet_(SHEET_NOTES);ensureColumns_(sh,NOTE_HEADERS);var now=new Date(),id=data['メモID']||uid_('N');
  var rec=merge_(blank_(NOTE_HEADERS),data);rec['メモID']=id;rec['登録日時']=now;rec['更新日時']=now;
  sh.appendRow(NOTE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function updateNote_(id,data){ var sh=sheet_(SHEET_NOTES);ensureColumns_(sh,NOTE_HEADERS);var r=findRow_(sh,'メモID',id);if(r<0)throw'メモIDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,NOTE_HEADERS),data);rec['メモID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,NOTE_HEADERS.length).setValues([NOTE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteNote_(id,secret){ return softDeleteById_(SHEET_NOTES,'メモID',id,secret); }

// ===== 工事台帳・原価管理（v23）=====
function listCosts_(){ return readAll_(SHEET_COSTS,COST_HEADERS,'原価ID'); }
function addCost_(data){ var sh=sheet_(SHEET_COSTS);ensureColumns_(sh,COST_HEADERS);var now=new Date(),id=data['原価ID']||uid_('G');
  var rec=merge_(blank_(COST_HEADERS),data);rec['原価ID']=id;rec['登録日時']=now;rec['更新日時']=now;
  sh.appendRow(COST_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function updateCost_(id,data){ var sh=sheet_(SHEET_COSTS);ensureColumns_(sh,COST_HEADERS);var r=findRow_(sh,'原価ID',id);if(r<0)throw'原価IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,COST_HEADERS),data);rec['原価ID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,COST_HEADERS.length).setValues([COST_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteCost_(id,secret){ return softDeleteById_(SHEET_COSTS,'原価ID',id,secret); }
function laborByProject_(){ var reps=listReports_(),m={};
  reps.forEach(function(r){ var id=String(r['案件ID']||''); if(!id)return;
    if(!m[id])m[id]={labor:0,ninku:0};
    var lc=Number(String(r['労務費']==null?'':r['労務費']).replace(/[,，]/g,''));
    var nk=Number(String(r['人工']==null?'':r['人工']).replace(/[,，]/g,''));
    if(!isNaN(lc))m[id].labor+=lc; if(!isNaN(nk))m[id].ninku+=nk; });
  return m; }

// ===== 工事車両管理（v25）=====
function listVehicles_(){ var all=readAll_(SHEET_VEHICLES,VEHICLE_HEADERS,'車両ID');
  all.sort(function(a,b){var x=Number(a['表示順'])||999,y=Number(b['表示順'])||999;return x-y||String(a['車両名']||'').localeCompare(String(b['車両名']||''),'ja');});
  return all; }
function addVehicle_(data){ var sh=sheet_(SHEET_VEHICLES);ensureColumns_(sh,VEHICLE_HEADERS);var now=new Date(),id=data['車両ID']||uid_('V');
  var rec=merge_(blank_(VEHICLE_HEADERS),data);rec['車両ID']=id;rec['登録日時']=now;rec['更新日時']=now;
  sh.appendRow(VEHICLE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function updateVehicle_(id,data){ var sh=sheet_(SHEET_VEHICLES);ensureColumns_(sh,VEHICLE_HEADERS);var r=findRow_(sh,'車両ID',id);if(r<0)throw'車両IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,VEHICLE_HEADERS),data);rec['車両ID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,VEHICLE_HEADERS.length).setValues([VEHICLE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteVehicle_(id,secret){ return softDeleteById_(SHEET_VEHICLES,'車両ID',id,secret); }
/* 距離の更新・オイル交換の記録（誰でも可：現場からの距離報告用）*/
function vehicleOdo_(data){ var sh=sheet_(SHEET_VEHICLES);ensureColumns_(sh,VEHICLE_HEADERS);
  var id=data['車両ID'],r=findRow_(sh,'車両ID',id);if(r<0)throw'車両IDが見つかりません: '+id;
  var rec=rowToObj_(sh,r,VEHICLE_HEADERS),now=new Date(),tz=Session.getScriptTimeZone();
  var raw=data['現在距離'];
  if(raw!=null&&String(raw)!==''){ var km=Number(String(raw).replace(/[,，]/g,''));
    if(!isNaN(km)){ rec['現在距離']=km; rec['距離更新日']=Utilities.formatDate(now,tz,'yyyy-MM-dd'); } }
  if(data['オイル交換']){ rec['前回オイル交換日']=Utilities.formatDate(now,tz,'yyyy-MM-dd'); rec['前回オイル交換距離']=rec['現在距離']; }
  rec['更新日時']=now;
  sh.getRange(r,1,1,VEHICLE_HEADERS.length).setValues([VEHICLE_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
  return readObj_(rec); }
/* 案件×車両ごとの使用日数（作業日報の車両列から集計。同じ日に複数行あっても1日と数える）*/
function vehicleUsage_(){ var reps=listReports_(),m={};
  reps.forEach(function(r){ var pid=String(r['案件ID']||''),vs=String(r['車両']||''),d=String(r['日付']||''); if(!pid||!vs||!d)return;
    vs.split(',').forEach(function(v){ v=v.trim(); if(!v)return;
      if(!m[pid])m[pid]={}; if(!m[pid][v])m[pid][v]={}; m[pid][v][d]=1; }); });
  var out={};
  Object.keys(m).forEach(function(pid){ out[pid]={}; Object.keys(m[pid]).forEach(function(v){ out[pid][v]=Object.keys(m[pid][v]).length; }); });
  return out; }

// ===== 写真台帳：フォルダ再帰・写真収集（v26で復元）=====
// 写真フォルダ配下のサブフォルダを全階層たどり、'施工 / 仮設' 形式の名前で平坦化して返す
function collectFolders_(folder, prefix, out){
  var it=folder.getFolders();
  while(it.hasNext()){ var f=it.next(); var name=prefix?(prefix+' / '+f.getName()):f.getName();
    out.push({id:f.getId(), name:name});
    if(out.length<300) collectFolders_(f, name, out); }
}
// 指定フォルダ＋その配下すべての画像を再帰で集める。表示用にリンク共有（閲覧）を自動付与
function collectPhotos_(folder, out){
  var fi=folder.getFiles();
  while(fi.hasNext()){ var x=fi.next();
    if(String(x.getMimeType()||'').indexOf('image')===0){
      try{ if(x.getSharingAccess()!==DriveApp.Access.ANYONE_WITH_LINK) x.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW); }catch(e){}
      out.push({name:x.getName(), id:x.getId(), url:x.getUrl()});
      if(out.length>500) return; } }
  var fo=folder.getFolders();
  while(fo.hasNext()){ if(out.length>500)return; collectPhotos_(fo.next(), out); }
}

// ===== 工事写真台帳のExcel/PDF生成（v27で復元）=====
// テンプレート（Googleスプレッドシート）を探す。名前に「工事写真台帳」「テンプレート」を両方含むものを使用
function findTemplate_(){
  var TPL_ID='';
  if(TPL_ID){ try{return DriveApp.getFileById(TPL_ID);}catch(e){} }
  // v118: 既存の古いテンプレートより、GenCan標準テンプレートを優先する。
  var std=findLedgerTemplateByName_('工事写真台帳テンプレート_GenCan標準');
  if(std) return std;
  // なければ自動作成する。これにより導入時に手動でテンプレートを作らなくても台帳出力できる。
  try{
    std=createLedgerTemplate_();
    if(std) return std;
  }catch(e){ Logger.log('標準写真台帳テンプレート自動作成失敗: '+e); }
  // 最後の保険として、旧テンプレートを使用する。
  var cands=[];
  var it=DriveApp.searchFiles('mimeType="application/vnd.google-apps.spreadsheet" and title contains "工事写真台帳" and trashed=false');
  while(it.hasNext()){ var f=it.next(); var nm=String(f.getName()||'');
    if(nm.indexOf('工事写真台帳')>=0 && nm.indexOf('テンプレート')>=0) cands.push(f); }
  for(var i=0;i<cands.length;i++){
    try{ var ss=SpreadsheetApp.openById(cands[i].getId()); if(ss && ss.getSheets && ss.getSheets().length>0) return cands[i]; }catch(e){}
  }
  throw 'テンプレートを自動作成できませんでした。Google Driveの権限とApps Scriptの承認を確認してください。';
}
function findLedgerTemplateByName_(name){
  try{
    var q='mimeType="application/vnd.google-apps.spreadsheet" and title contains "'+String(name).replace(/"/g,'')+'" and trashed=false';
    var it=DriveApp.searchFiles(q);
    while(it.hasNext()){
      var f=it.next();
      if(String(f.getName()||'')===name){
        try{ var ss=SpreadsheetApp.openById(f.getId()); if(ss && ss.getSheets && ss.getSheets().length>0) return f; }catch(e){}
      }
    }
  }catch(e){}
  return null;
}
function createLedgerTemplate(){ return createLedgerTemplate_(); }
function createLedgerTemplate_(){
  var name='工事写真台帳テンプレート_GenCan標準';
  var old=findLedgerTemplateByName_(name);
  if(old) return old;
  var ss=SpreadsheetApp.create(name);
  var file=DriveApp.getFileById(ss.getId());
  try{
    var parent=getParent_();
    parent.addFile(file);
    try{ DriveApp.getRootFolder().removeFile(file); }catch(e){}
  }catch(e){}
  var sh=ss.getSheets()[0];
  sh.setName('1');
  buildLedgerTemplateSheet_(sh);
  SpreadsheetApp.flush();
  try{ file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW); }catch(e){}
  return file;
}
function buildLedgerTemplateSheet_(sh){
  sh.clear();
  // A4縦・3枚/ページ想定。写真セルは「ここに写真」を含むマージセルとして検出される。
  var maxRows=36, maxCols=6;
  if(sh.getMaxRows()<maxRows) sh.insertRowsAfter(sh.getMaxRows(), maxRows-sh.getMaxRows());
  if(sh.getMaxColumns()<maxCols) sh.insertColumnsAfter(sh.getMaxColumns(), maxCols-sh.getMaxColumns());
  if(sh.getMaxRows()>maxRows) sh.deleteRows(maxRows+1, sh.getMaxRows()-maxRows);
  if(sh.getMaxColumns()>maxCols) sh.deleteColumns(maxCols+1, sh.getMaxColumns()-maxCols);
  for(var c=1;c<=6;c++) sh.setColumnWidth(c, 86);
  var heights={1:30,2:24,3:24,4:8,5:24,6:24,7:24,8:24,9:24,10:24,11:24,12:24,13:24,14:18,15:8,16:24,17:24,18:24,19:24,20:24,21:24,22:24,23:24,24:24,25:18,26:8,27:24,28:24,29:24,30:24,31:24,32:24,33:24,34:24,35:24,36:18};
  for(var r=1;r<=maxRows;r++) sh.setRowHeight(r, heights[r]||22);
  sh.getRange('A1:F1').merge().setValue('工事写真台帳').setFontSize(18).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.getRange('A2:B2').merge().setValue('工事名').setFontWeight('bold').setBackground('#eef3f8').setHorizontalAlignment('center');
  sh.getRange('C2:F2').merge().setValue('').setHorizontalAlignment('left');
  sh.getRange('A3:B3').merge().setValue('作成日').setFontWeight('bold').setBackground('#eef3f8').setHorizontalAlignment('center');
  sh.getRange('C3:F3').merge().setValue('').setHorizontalAlignment('left');
  var slots=[{n:1,photo:'A5:F12',meta:'A13:F14'},{n:2,photo:'A16:F23',meta:'A24:F25'},{n:3,photo:'A27:F34',meta:'A35:F36'}];
  slots.forEach(function(s){
    sh.getRange(s.photo).merge().setValue('ここに写真'+s.n).setFontColor('#9aa9b8').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setBackground('#f7fafc');
    sh.getRange(s.meta).merge().setValue('工種：\n撮影箇所：\n備考：').setFontSize(9).setWrap(true).setVerticalAlignment('top').setHorizontalAlignment('left').setBackground('#ffffff');
    sh.getRange(s.photo).setBorder(true,true,true,true,true,true,'#9fb0c2',SpreadsheetApp.BorderStyle.SOLID);
    sh.getRange(s.meta).setBorder(true,true,true,true,true,true,'#9fb0c2',SpreadsheetApp.BorderStyle.SOLID);
  });
  sh.getRange('A1:F36').setFontFamily('Arial').setFontColor('#1f2d3d');
  sh.getRange('A2:F3').setBorder(true,true,true,true,true,true,'#9fb0c2',SpreadsheetApp.BorderStyle.SOLID);
  sh.setFrozenRows(0);
}
// 「ここに写真」を含むマージセルを写真の貼り付け位置として取得
function findPhotoSlots_(sheet){
  var slots=[];
  var merges=[]; try{ merges=sheet.getDataRange().getMergedRanges()||[]; }catch(e){ merges=[]; }
  for(var i=0;i<merges.length;i++){
    var r=merges[i], v=String(r.getCell(1,1).getValue()||'');
    if(v.indexOf('ここに写真')>=0){ slots.push({row:r.getRow(),col:r.getColumn(),nr:r.getNumRows(),nc:r.getNumColumns()}); }
  }
  // マージセルで見つからない場合は単一セルの「ここに写真」も探す
  if(!slots.length){
    var data=sheet.getDataRange().getValues();
    for(var rr=0;rr<data.length;rr++){ for(var cc=0;cc<data[rr].length;cc++){
      if(String(data[rr][cc]||'').indexOf('ここに写真')>=0) slots.push({row:rr+1,col:cc+1,nr:1,nc:1});
    } }
  }
  slots.sort(function(a,b){return (a.row-b.row)||(a.col-b.col);});
  return slots;
}
function clearSlot_(sheet,s){ try{sheet.getRange(s.row,s.col).setValue('');}catch(e){} }
// 写真をスロットに合わせて貼り付け（縦横比維持・中央寄せ）
function placePhoto_(sheet,s,blob){
  sheet.getRange(s.row,s.col).setValue('');
  var aw=0,ah=0,c,r;
  for(c=s.col;c<s.col+s.nc;c++) aw+=sheet.getColumnWidth(c);
  for(r=s.row;r<s.row+s.nr;r++) ah+=sheet.getRowHeight(r);
  var pad=6, fw=aw-pad*2, fh=ah-pad*2;
  var img=sheet.insertImage(blob, s.col, s.row);
  var iw=img.getWidth()||4, ih=img.getHeight()||3;
  var sc=Math.min(fw/iw, fh/ih); if(sc>3)sc=3; if(!(sc>0))sc=1;
  var w=Math.max(1,Math.round(iw*sc)), h=Math.max(1,Math.round(ih*sc));
  img.setWidth(w).setHeight(h);
  img.setAnchorCellXOffset(Math.max(0,Math.round((aw-w)/2)));
  img.setAnchorCellYOffset(Math.max(0,Math.round((ah-h)/2)));
}
// ラベル（工事名・作成日）の右隣セルに値を書き込む
function setByLabel_(sheet,label,val){
  var data=sheet.getDataRange().getValues(), key=String(label).replace(/\s/g,'');
  for(var r=0;r<data.length;r++){ for(var c=0;c<data[r].length;c++){
    if(String(data[r][c]).replace(/\s/g,'')===key){ try{sheet.getRange(r+1,c+2).setValue(val);}catch(e){} return; }
  } }
}
function ymd_(){ var tz=Session.getScriptTimeZone(); return Utilities.formatDate(new Date(),tz,'yyyy-MM-dd'); }
// v117: フロントから送られた写真情報（工種・撮影箇所・備考）を台帳へ反映
function parseLedgerMeta_(p){
  var raw=String((p&&p.meta)||'');
  if(!raw)return {};
  try{
    var obj=JSON.parse(raw);
    if(!obj)return {};
    if(Object.prototype.toString.call(obj)==='[object Array]'){
      var m={}; obj.forEach(function(x){ if(x&&x.id)m[String(x.id)]=x; }); return m;
    }
    return obj;
  }catch(e){ return {}; }
}
function ledgerClean_(v){ return String(v||'').replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ').trim().slice(0,120); }
function fillPhotoMetaCell_(sh, slot, meta){
  meta=meta||{};
  var kind=ledgerClean_(meta.kind), place=ledgerClean_(meta.place), memo=ledgerClean_(meta.memo);
  var lines=['工種：'+(kind||''),'撮影箇所：'+(place||''),'備考：'+(memo||'')];
  var r=slot.row+slot.nr, c=slot.col;
  if(r>sh.getMaxRows())return;
  try{
    var cols=Math.max(1, Math.min(slot.nc||1, sh.getMaxColumns()-c+1));
    var rg=sh.getRange(r,c,1,cols);
    // テンプレート側でメモ欄が複数行マージ済みの場合は、そのマージ全体へ書き込む。
    try{
      var merges=sh.getRange(r,c,Math.min(3,sh.getMaxRows()-r+1),cols).getMergedRanges()||[];
      for(var i=0;i<merges.length;i++){
        if(merges[i].getRow()===r && merges[i].getColumn()===c){ rg=merges[i]; break; }
      }
    }catch(e){}
    rg.setValue(lines.join('\n')).setWrap(true).setFontSize(9).setVerticalAlignment('top').setHorizontalAlignment('left');
    try{ rg.setBorder(true,true,true,true,true,true,'#9fb0c2',SpreadsheetApp.BorderStyle.SOLID); }catch(e2){}
  }catch(e){}
}
// 写真台帳の生成本体（fmt='pdf' または 'xlsx'）
function makeLedgerFiles_(p){
  var ids=String(p.ids||'').split(',').filter(function(x){return x;});
  if(!ids.length) throw '写真が選択されていません';
  var name=String(p.name||'')||p.id;
  var fmt=String(p.fmt||'pdf');
  var ledgerMeta=parseLedgerMeta_(p);
  var tpl=findTemplate_();
  var outName='工事写真台帳_'+name+'_'+ymd_();
  var dest=ensureSub_(getCaseFolder_(p.id),'台帳');
  var outFile=tpl.makeCopy(outName, dest);
  var ss=SpreadsheetApp.openById(outFile.getId());
  var page=ss.getSheets()[0];
  if(!page) throw 'テンプレートのシートを開けませんでした';
  var per=findPhotoSlots_(page).length||3;
  var pages=Math.ceil(ids.length/per);
  page.setName('1'); var pg=[page];
  for(var i=1;i<pages;i++){ var cp=page.copyTo(ss); cp.setName(String(i+1)); pg.push(cp); }
  for(var pi=0;pi<pages;pi++){
    var sh=pg[pi];
    setByLabel_(sh,'工事名',name); setByLabel_(sh,'作成日',ymd_());
    var slots=findPhotoSlots_(sh);
    for(var si=0;si<slots.length;si++){
      var idx=pi*per+si;
      if(idx>=ids.length){ clearSlot_(sh,slots[si]); fillPhotoMetaCell_(sh, slots[si], {}); continue; }
      var fid=ids[idx].trim();
      placePhotoCell_(sh, slots[si].row, slots[si].col, fid);
      fillPhotoMetaCell_(sh, slots[si], ledgerMeta[fid]||{});
    }
  }
  SpreadsheetApp.flush();
  var out={ok:true, name:outName, n:ids.length, sheetUrl:outFile.getUrl(), folderUrl:dest.getUrl()};
  if(fmt==='xlsx'){
    // スプレッドシートを.xlsx形式にエクスポート（newCellImageの写真がxl/media/に焼き込まれる）
    var xurl='https://docs.google.com/spreadsheets/d/'+outFile.getId()+'/export?format=xlsx';
    var resp=UrlFetchApp.fetch(xurl,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
    var xf=dest.createFile(resp.getBlob().setName(outName+'.xlsx'));
    try{xf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
    out.xlsxUrl=xf.getUrl(); out.fileUrl=xf.getUrl(); out.fileName=xf.getName();
    try{outFile.setTrashed(true);}catch(e){}
  } else {
    var pf=dest.createFile(outFile.getAs('application/pdf').setName(outName+'.pdf'));
    try{pf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
    out.pdfUrl=pf.getUrl(); out.fileUrl=pf.getUrl(); out.fileName=pf.getName();
    try{outFile.setTrashed(true);}catch(e){}
  }
  return out;
}


// ===== 工事写真台帳：作成済み台帳一覧（v119）=====
function ledgerTypeText_(mime,name){
  name=String(name||''); mime=String(mime||'');
  if(mime.indexOf('spreadsheet')>=0 || /\.xlsx$/i.test(name)) return 'Excel';
  if(mime.indexOf('pdf')>=0 || /\.pdf$/i.test(name)) return 'PDF';
  return 'ファイル';
}
function listLedgerFiles_(p){
  var pid=String((p&&p.id)||'');
  if(!pid) throw '案件IDが指定されていません';
  var dest=ensureSub_(getCaseFolderFast_(pid),'台帳');
  var it=dest.getFiles(), rows=[];
  while(it.hasNext()){
    var f=it.next();
    try{
      if(f.isTrashed && f.isTrashed()) continue;
    }catch(e){}
    var name=f.getName(), mime=f.getMimeType()||'', updated=f.getLastUpdated ? f.getLastUpdated() : new Date();
    rows.push({
      name:name,
      url:f.getUrl(),
      id:f.getId(),
      type:ledgerTypeText_(mime,name),
      mime:mime,
      updatedAt:updated.getTime ? updated.getTime() : 0,
      updated:Utilities.formatDate(updated,Session.getScriptTimeZone(),'yyyy-MM-dd HH:mm'),
      size:Number(f.getSize&&f.getSize()||0)
    });
  }
  rows.sort(function(a,b){return Number(b.updatedAt||0)-Number(a.updatedAt||0);});
  rows=rows.slice(0,50).map(function(x){
    var sz=Number(x.size||0);
    x.sizeText=sz?((sz>=1048576?(Math.round(sz/1048576*10)/10+'MB'):(Math.max(1,Math.round(sz/1024))+'KB'))):'';
    return x;
  });
  return {files:rows,folderUrl:dest.getUrl()};
}

// ===== 写真をセル内画像（newCellImage）で配置 - v31 =====
// Sheet.insertImage（浮き画像）はGASのPDFエクスポートに含まれない。
// SpreadsheetApp.newCellImage() によるセル内画像はPDF出力に含まれる。
// ファイルは collectPhotos_ でリンク共有済みのため、Drive thumbnailURLが使用可能。
function placePhotoCell_(sh, row, col, fileId){
  var url='https://drive.google.com/thumbnail?id='+fileId+'&sz=w1600';
  try{
    var cellImg=SpreadsheetApp.newCellImage().setSourceUrl(url).build();
    sh.getRange(row, col).setValue(cellImg);
  }catch(e){
    try{ sh.getRange(row, col).setValue(''); }catch(e2){}
  }
}

// ===== 現場管理DBの自動バックアップ（v107）=====
// 「現場管理DB_バックアップ」フォルダに、DB全体のコピーを日付名で保存。
// 毎日午前2時ごろに自動実行。古い世代（既定30世代）を超えたら自動でゴミ箱へ移動。
var BACKUP_FOLDER_NAME='現場管理DB_バックアップ';
var BACKUP_KEEP=30;   // 残す世代数：30日分
var BACKUP_HOUR=2;    // 自動バックアップ時刻：午前2時ごろ

function backupFolder_(){
  var parent=getParent_();   // 河口電機_現場管理 フォルダ
  return ensureSub_(parent, BACKUP_FOLDER_NAME);
}
// バックアップ本体：現在のDBスプレッドシートをコピーして保存
function runBackup_(){
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var srcFile=DriveApp.getFileById(ss.getId());
  var tz=Session.getScriptTimeZone();
  var stamp=Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd_HHmm');
  var name=(ss.getName()||'現場管理DB')+'_バックアップ_'+stamp;
  var folder=backupFolder_();
  var copy=srcFile.makeCopy(name, folder);
  pruneBackups_(folder);
  return {name:name, url:copy.getUrl(), folderUrl:folder.getUrl()};
}
// 古い世代を削除（ファイル名でソートし、新しい方からBACKUP_KEEP個だけ残す）
function pruneBackups_(folder){
  var it=folder.getFiles(), arr=[];
  while(it.hasNext()){ var f=it.next(); var n=String(f.getName()||'');
    if(n.indexOf('バックアップ')>=0) arr.push(f); }
  arr.sort(function(a,b){ return String(b.getName()).localeCompare(String(a.getName())); });   // 新しい順
  for(var i=BACKUP_KEEP;i<arr.length;i++){ try{ arr[i].setTrashed(true); }catch(e){} }
}
// 自動バックアップの送信先メール（GASを動かしているアカウント自身）
function backupMailTo_(){
  try{ var a=Session.getActiveUser().getEmail(); if(a) return a; }catch(e){}
  try{ var b=Session.getEffectiveUser().getEmail(); if(b) return b; }catch(e){}
  return '';
}
// 毎日トリガーから呼ばれる関数：バックアップを作成し、成功/失敗をメール通知
function dailyBackup(){
  var to=backupMailTo_();
  try{
    var r=runBackup_();
    if(to){
      try{ MailApp.sendEmail(to,
        '【'+COMPANY_NAME+'】バックアップ完了 '+r.name,
        'おはようございます。\n'+COMPANY_NAME+' 現場管理DBの自動バックアップが正常に完了しました。\n\n'+
        'ファイル名：'+r.name+'\n保存先フォルダ：'+r.folderUrl+'\n\n'+
        'このメールは毎日自動送信されます。届かない日が続いた場合は、バックアップが止まっている可能性があります。'
      ); }catch(e){}
    }
  }catch(err){
    if(to){
      try{ MailApp.sendEmail(to,
        '⚠【'+COMPANY_NAME+'】バックアップ失敗',
        COMPANY_NAME+' 現場管理DBの自動バックアップに失敗しました。\n\nエラー内容：\n'+err+'\n\n'+
        'GASエディタを開き、メニュー「▶バックアップ→今すぐバックアップを作成」で手動実行をお試しください。'
      ); }catch(e){}
    }
  }
}
// 旧名（週次）も残し、毎日版へ転送（既存トリガーが残っていても動くように）
function weeklyBackup(){ dailyBackup(); }

// ---- メニュー操作 ----
function menuBackupNow(){
  try{ var r=runBackup_();
    SpreadsheetApp.getUi().alert('バックアップを作成しました：\n'+r.name+'\n\n保存先フォルダ：\n'+r.folderUrl);
  }catch(e){ try{SpreadsheetApp.getUi().alert('バックアップに失敗しました：\n'+e);}catch(e2){} }
}
// 自動バックアップ設定を作成・更新する公開関数。
// GASエディタから直接実行してもOKです。
function installDailySpreadsheetBackup(){
  var removed=0;
  var trgs=ScriptApp.getProjectTriggers();
  for(var i=0;i<trgs.length;i++){
    var h=trgs[i].getHandlerFunction();
    if(h==='weeklyBackup'||h==='dailyBackup'){
      try{ ScriptApp.deleteTrigger(trgs[i]); removed++; }catch(e){}
    }
  }
  ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(BACKUP_HOUR).create();
  return {ok:true, removed:removed, hour:BACKUP_HOUR, keep:BACKUP_KEEP, folderUrl:backupFolder_().getUrl(), mailTo:backupMailTo_()};
}

function backupTriggerStatus_(){
  var trgs=ScriptApp.getProjectTriggers(), list=[];
  for(var i=0;i<trgs.length;i++){
    var h=trgs[i].getHandlerFunction();
    if(h==='weeklyBackup'||h==='dailyBackup') list.push(h);
  }
  return {enabled:list.indexOf('dailyBackup')>=0, triggers:list, hour:BACKUP_HOUR, keep:BACKUP_KEEP, folderUrl:backupFolder_().getUrl(), mailTo:backupMailTo_()};
}



// Web画面用：バックアップ状態・一覧取得（v133）
function listBackups_(limit){
  limit = Number(limit||30); if(!limit || limit<1) limit=30; if(limit>100) limit=100;
  var folder = backupFolder_();
  var it = folder.getFiles();
  var arr=[];
  while(it.hasNext()){
    var f = it.next();
    var name = String(f.getName()||'');
    var mt = '';
    try{ mt = f.getMimeType(); }catch(e){}
    if(name.indexOf('バックアップ')>=0 || name.indexOf('データビュワー')>=0 || mt===MimeType.GOOGLE_SHEETS || mt==='text/html'){
      var d = null;
      try{ d=f.getDateCreated(); }catch(e){ d=new Date(0); }
      arr.push({
        id: f.getId(),
        name: name,
        url: f.getUrl(),
        mimeType: mt,
        createdAt: fmt_(d),
        size: (function(){try{return f.getSize();}catch(e){return '';}})()
      });
    }
  }
  arr.sort(function(a,b){ return String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  return arr.slice(0,limit);
}
function backupStatusWeb_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var folder = backupFolder_();
  var trigger = backupTriggerStatus_();
  var backups = listBackups_(20);
  return {
    ok:true,
    appVersion:'v2026.06.20-43.8.3',
    gasFile:'Code_v143.gs',
    spreadsheetName:ss.getName(),
    spreadsheetUrl:ss.getUrl(),
    backupFolderName:BACKUP_FOLDER_NAME,
    folderUrl:folder.getUrl(),
    keep:BACKUP_KEEP,
    hour:BACKUP_HOUR,
    mailTo:backupMailTo_(),
    trigger:trigger,
    backups:backups,
    latest:backups.length?backups[0]:null
  };
}
function backupNowWeb_(){
  var r = runBackup_();
  var st = backupStatusWeb_();
  st.created = r;
  return st;
}
function backupOfflineExportToDrive_(){
  var r = offlineExport_();
  var bytes = Utilities.base64Decode(r.htmlBase64);
  var safeCompany = String(r.company||'GenCan').replace(/[\\/:*?"<>|]/g,'_');
  var fn = 'データビュワー_'+safeCompany+'_'+String(r.stamp||fmt_(new Date())).replace(/[ :]/g,'-')+'.html';
  var blob = Utilities.newBlob(bytes, 'text/html', fn);
  var folder = backupFolder_();
  var f = folder.createFile(blob);
  return {ok:true,name:f.getName(),url:f.getUrl(),folderUrl:folder.getUrl(),createdAt:fmt_(new Date())};
}

function menuBackupEnable(){
  try{
    var r=installDailySpreadsheetBackup();
    SpreadsheetApp.getUi().alert('自動バックアップを設定しました。\n\n毎日午前'+BACKUP_HOUR+'時ごろに、DB全体のコピーを\n「'+BACKUP_FOLDER_NAME+'」フォルダへ自動保存します。\n古いものは'+BACKUP_KEEP+'世代まで残し、それ以前は自動削除します。\n\n保存先：\n'+r.folderUrl+'\n\n結果は毎日 '+(r.mailTo||'(取得できませんでした)')+' 宛にメール通知します。');
  }catch(e){ try{ SpreadsheetApp.getUi().alert('自動バックアップ設定に失敗しました：\n'+e); }catch(e2){} }
}
function menuBackupStatus(){
  try{
    var s=backupTriggerStatus_();
    SpreadsheetApp.getUi().alert('自動バックアップの状態\n\n状態：'+(s.enabled?'有効':'未設定')+'\nトリガー：'+(s.triggers.length?s.triggers.join(', '):'なし')+'\n実行時刻：毎日 午前'+s.hour+'時ごろ\n保存世代：'+s.keep+'世代\n保存先：\n'+s.folderUrl+'\n通知先：'+(s.mailTo||'(取得できませんでした)'));
  }catch(e){ try{ SpreadsheetApp.getUi().alert('状態確認に失敗しました：\n'+e); }catch(e2){} }
}
function menuBackupDisable(){
  var trgs=ScriptApp.getProjectTriggers(), n=0;
  for(var i=0;i<trgs.length;i++){ var h=trgs[i].getHandlerFunction(); if(h==='weeklyBackup'||h==='dailyBackup'){ ScriptApp.deleteTrigger(trgs[i]); n++; } }
  try{ SpreadsheetApp.getUi().alert(n>0?'自動バックアップを停止しました。':'自動バックアップは設定されていません。'); }catch(e){}
}
function menuBackupOpen(){
  try{ SpreadsheetApp.getUi().alert('バックアップ一覧フォルダのURL：\n\n'+backupFolder_().getUrl()); }catch(e){}
}

// ===== 仕入先マスタ（v36）=====
var SUPPLIER_HEADERS=['仕入先ID','仕入先名','略称','種別','電話番号','メモ','登録日時','更新日時','担当者名','メールアドレス'];
var SHEET_PRODUCTS='商品マスタ';
var PRODUCT_HEADERS=['商品ID','商品名','規格','単位','標準仕入先','単価','メモ','表示順','登録日時','更新日時','在庫数','発注点','置き場所'];
var SHEET_STOCKLOG='在庫移動';
var STOCKLOG_HEADERS=['移動ID','日時','商品ID','品名','種別','数量','調整前','調整後','現場ID','現場名','メモ','作業員ID','作業員名','登録日時'];
var SHEET_ORDERS='発注履歴';
var ORDER_HEADERS=['発注ID','発注日時','仕入先ID','仕入先名','担当者名','宛先','件名','本文','明細','点数','希望納期','現場ID','現場名','送信方法','状態','備考','登録日時','更新日時'];
function listSuppliers_(){ return readAll_(SHEET_SUPPLIERS,SUPPLIER_HEADERS,'仕入先ID'); }
function supplierSave_(d){
  var sh=sheet_(SHEET_SUPPLIERS); ensureColumns_(sh,SUPPLIER_HEADERS); var last=sh.getLastRow();
  if(!String(d['仕入先ID']||'').trim()){
    d['仕入先ID']='SUP'+String(Date.now()).slice(-6);
    d['登録日時']=fmt_(new Date());
  }
  d['更新日時']=fmt_(new Date());
  var rows=(last>=2)?sh.getRange(2,1,last-1,1).getValues():[];
  for(var i=0;i<rows.length;i++){ if(String(rows[i][0])===String(d['仕入先ID'])){
    var rec=merge_(rowToObj_(sh,i+2,SUPPLIER_HEADERS),d);
    sh.getRange(i+2,1,1,SUPPLIER_HEADERS.length).setValues([SUPPLIER_HEADERS.map(function(h){return rec[h]==null?'':rec[h];})]);
    return rowToObj_(sh,i+2,SUPPLIER_HEADERS); } }
  var rec2=merge_(blank_(SUPPLIER_HEADERS),d);
  sh.appendRow(SUPPLIER_HEADERS.map(function(h){return rec2[h]==null?'':rec2[h];})); last=sh.getLastRow();
  return rowToObj_(sh,last,SUPPLIER_HEADERS);
}
function supplierDelete_(id,secret){ return softDeleteById_(SHEET_SUPPLIERS,'仕入先ID',id,secret); }

// ===== 商品マスタ（定番材料）・発注履歴（v53）=====
function listProducts_(){ return readAll_(SHEET_PRODUCTS,PRODUCT_HEADERS,'商品ID'); }
function productSave_(d){
  var sh=sheet_(SHEET_PRODUCTS); ensureColumns_(sh,PRODUCT_HEADERS); var last=sh.getLastRow();
  var now=fmt_(new Date());
  if(!String(d['商品ID']||'').trim()){ d['商品ID']=uid_('PR'); d['登録日時']=now; }
  d['更新日時']=now;
  var rows=(last>=2)?sh.getRange(2,1,last-1,1).getValues():[];
  for(var i=0;i<rows.length;i++){ if(String(rows[i][0])===String(d['商品ID'])){
    var rec=merge_(rowToObj_(sh,i+2,PRODUCT_HEADERS),d);
    sh.getRange(i+2,1,1,PRODUCT_HEADERS.length).setValues([PRODUCT_HEADERS.map(function(h){return rec[h]==null?'':rec[h];})]);
    return rowToObj_(sh,i+2,PRODUCT_HEADERS); } }
  var rec2=merge_(blank_(PRODUCT_HEADERS),d);
  sh.appendRow(PRODUCT_HEADERS.map(function(h){return rec2[h]==null?'':rec2[h];}));
  return rowToObj_(sh,sh.getLastRow(),PRODUCT_HEADERS);
}
function productDelete_(id,secret){ return softDeleteById_(SHEET_PRODUCTS,'商品ID',id,secret); }
function listOrders_(){ return readAll_(SHEET_ORDERS,ORDER_HEADERS,'発注ID'); }
function orderSave_(d){
  var sh=sheet_(SHEET_ORDERS); ensureColumns_(sh,ORDER_HEADERS); var last=sh.getLastRow();
  var now=fmt_(new Date());
  if(!String(d['発注ID']||'').trim()){ d['発注ID']=uid_('OD'); d['登録日時']=now; if(!d['発注日時'])d['発注日時']=now; }
  d['更新日時']=now;
  var rows=(last>=2)?sh.getRange(2,1,last-1,1).getValues():[];
  for(var i=0;i<rows.length;i++){ if(String(rows[i][0])===String(d['発注ID'])){
    var rec=merge_(rowToObj_(sh,i+2,ORDER_HEADERS),d);
    sh.getRange(i+2,1,1,ORDER_HEADERS.length).setValues([ORDER_HEADERS.map(function(h){return rec[h]==null?'':rec[h];})]);
    return rowToObj_(sh,i+2,ORDER_HEADERS); } }
  var rec2=merge_(blank_(ORDER_HEADERS),d);
  sh.appendRow(ORDER_HEADERS.map(function(h){return rec2[h]==null?'':rec2[h];}));
  return rowToObj_(sh,sh.getLastRow(),ORDER_HEADERS);
}
function orderDelete_(id,secret){ return softDeleteById_(SHEET_ORDERS,'発注ID',id,secret); }
// ===== 在庫調整・入出庫履歴（v54）=====
function stockAdjust_(d){
  var pid=String(d['商品ID']||'').trim(); if(!pid)throw '商品IDがありません';
  var sh=sheet_(SHEET_PRODUCTS); ensureColumns_(sh,PRODUCT_HEADERS); var last=sh.getLastRow();
  var rows=(last>=2)?sh.getRange(2,1,last-1,1).getValues():[];
  var rowIdx=-1; for(var i=0;i<rows.length;i++){ if(String(rows[i][0])===pid){ rowIdx=i+2; break; } }
  if(rowIdx<0)throw '商品が見つかりません: '+pid;
  var rec=rowToObj_(sh,rowIdx,PRODUCT_HEADERS);
  var before=numv_(rec['在庫数']);
  var mode=String(d['mode']||'delta');
  var qty=numv_(d['数量']);
  var after=(mode==='set')?qty:(before+qty);   // delta時は qty を符号付きで渡す（出庫は負）
  if(after<0)after=0;
  rec['在庫数']=after; rec['更新日時']=fmt_(new Date());
  sh.getRange(rowIdx,1,1,PRODUCT_HEADERS.length).setValues([PRODUCT_HEADERS.map(function(h){return rec[h]==null?'':rec[h];})]);
  var lg=sheet_(SHEET_STOCKLOG); ensureColumns_(lg,STOCKLOG_HEADERS);
  var log=blank_(STOCKLOG_HEADERS);
  log['移動ID']=uid_('SM'); log['日時']=fmt_(new Date()); log['商品ID']=pid; log['品名']=rec['商品名']||'';
  log['種別']=d['種別']||(mode==='set'?'棚卸':(qty<0?'出庫':'入庫'));
  log['数量']=(mode==='set'?after:qty); log['調整前']=before; log['調整後']=after;
  log['現場ID']=d['現場ID']||''; log['現場名']=d['現場名']||''; log['メモ']=d['メモ']||'';
  log['作業員ID']=d['作業員ID']||''; log['作業員名']=d['作業員名']||''; log['登録日時']=fmt_(new Date());
  lg.appendRow(STOCKLOG_HEADERS.map(function(h){return log[h]==null?'':log[h];}));
  return rec;
}
function listStockLog_(){ return readAll_(SHEET_STOCKLOG,STOCKLOG_HEADERS,'移動ID'); }


// ===== セットアップ半自動化（v39）=====
// 購入者向け：先頭の COMPANY_NAME / TOKEN_ADMIN / TOKEN_GENERAL を書き換えた後、
// スプレッドシートの「▶セットアップ」→「初期設定を実行」を1回押すと、
// シート・フォルダ・自動バックアップが一度に揃います。
function setupGenba(){
  var report=[];
  // ① 必須シート12種類を作成
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var sheets=[
    [SHEET_PROJECTS,PROJECT_HEADERS],[SHEET_CUSTOMERS,CUSTOMER_HEADERS],
    [SHEET_WORKERS,WORKER_HEADERS],[SHEET_REPORTS,REPORT_HEADERS],
    [SHEET_SCHEDULE,SCHEDULE_HEADERS],[SHEET_KINTAI,KINTAI_HEADERS],
    [SHEET_CONTACTS,CONTACT_HEADERS],[SHEET_SETTINGS,SETTINGS_HEADERS],
    [SHEET_APPLICATIONS,APPLICATION_HEADERS],[SHEET_LEAVE,LEAVE_HEADERS],
    [SHEET_NOTES,NOTE_HEADERS],[SHEET_COSTS,COST_HEADERS],
    [SHEET_VEHICLES,VEHICLE_HEADERS],[SHEET_SUPPLIERS,SUPPLIER_HEADERS],
    [SHEET_EST,EST_HEADERS],[SHEET_TOOLS,TOOL_HEADERS],[SHEET_TOOLLEND,TOOLLEND_HEADERS],
    [SHEET_PRODUCTS,PRODUCT_HEADERS],[SHEET_ORDERS,ORDER_HEADERS],[SHEET_STOCKLOG,STOCKLOG_HEADERS],
    [SHEET_DAIKO,DAIKO_HEADERS],
    [SHEET_DOCS,DOC_HEADERS]
  ];
  var made=0;
  sheets.forEach(function(p){ if(!ss.getSheetByName(p[0])){ ensureSheet_(ss,p[0],p[1]); made++; } });
  report.push('・シート：'+made+'個を新規作成（合計'+sheets.length+'個）');

  // ② 設定シートに初期値を投入（既存値は上書きしない）
  var ssh=ss.getSheetByName(SHEET_SETTINGS),last=ssh.getLastRow();
  var existing={};
  if(last>=2){ var rs=ssh.getRange(2,1,last-1,2).getValues();
    for(var i=0;i<rs.length;i++){ if(rs[i][0]) existing[String(rs[i][0])]=true; } }
  var added=0;
  for(var k in SETTINGS_DEFAULT){ if(SETTINGS_DEFAULT.hasOwnProperty(k) && !existing[k]){
    ssh.appendRow([k,SETTINGS_DEFAULT[k]]); added++; } }
  report.push('・設定：初期値'+added+'項目を追加（既存値はそのまま）');

  // ③ 親フォルダを作成
  var parent=getParent_();
  report.push('・フォルダ：「'+PARENT_FOLDER_NAME+'」を準備（'+parent.getUrl()+'）');

  // ④ 写真台帳テンプレートを作成（既存があれば作り直さない）
  var tplExists=false;
  try{
    var it=DriveApp.searchFiles('mimeType="application/vnd.google-apps.spreadsheet" and title contains "工事写真台帳" and title contains "テンプレート" and trashed=false');
    if(it.hasNext()) tplExists=true;
  }catch(e){}
  if(!tplExists){ try{ createLedgerTemplate(); report.push('・写真台帳テンプレート：新規作成しました'); }catch(e){ report.push('・写真台帳テンプレート：作成失敗（'+e+'）'); } }
  else { report.push('・写真台帳テンプレート：既存を使用'); }

  // ⑤ 自動バックアップの毎日トリガーを設定（旧週次が残っていれば毎日へ張り替え）
  var bs=backupTriggerStatus_();
  if(!bs.enabled){
    try{ installDailySpreadsheetBackup(); report.push('・自動バックアップ：毎日午前'+BACKUP_HOUR+'時に設定しました（'+BACKUP_KEEP+'世代保存・結果をメール通知）'); }
    catch(e){ report.push('・自動バックアップ：設定に失敗（'+e+'）'); }
  } else { report.push('・自動バックアップ：すでに設定済み（毎日・'+BACKUP_KEEP+'世代保存）'); }

  // ⑥ Webアプリのデプロイ確認のお願い
  var msg='【セットアップ完了】\n\n会社名：'+COMPANY_NAME+'\n管理者PIN：設定済み\n共有あいことば：設定済み（公開HTMLには記載しません）\n\n'+report.join('\n')+
    '\n\n──次の手順──\n①「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」\n   実行ユーザー：自分／アクセス権：全員\n② 出てきた URL を各HTMLファイルの GAS_URL に貼り替え\n③ GitHubにアップロードして完了';
  try{ SpreadsheetApp.getUi().alert(msg); }catch(e){}
  return msg;
}
function menuSetupGenba(){
  try{ var ui=SpreadsheetApp.getUi();
    var r=ui.alert('初期設定を実行します。\n\n会社名：'+COMPANY_NAME+'\n管理者PIN：設定済み\n共有あいことば：設定済み\n\nこの内容で実行してよろしいですか？',ui.ButtonSet.OK_CANCEL);
    if(r===ui.Button.OK) setupGenba();
  }catch(e){}
}
function menuShowConfig(){
  try{ SpreadsheetApp.getUi().alert(
    '【現在の設定】\n\n会社名：'+COMPANY_NAME+'\n管理者PIN：設定済み'+'\n共有あいことば：設定済み'+
    '\nDriveフォルダ：'+PARENT_FOLDER_NAME+'\n\n変更したいときは、Apps Scriptエディタで\nファイル先頭の3行を書き換えてから、もう一度\n「▶セットアップ」→「初期設定を実行」を押してください。'); }catch(e){}
}

/* ===== v121 セットアップ確認・修復API ===== */
function setupSheetPairs_(){
  return [
    [SHEET_PROJECTS,PROJECT_HEADERS],[SHEET_CUSTOMERS,CUSTOMER_HEADERS],
    [SHEET_WORKERS,WORKER_HEADERS],[SHEET_REPORTS,REPORT_HEADERS],
    [SHEET_SCHEDULE,SCHEDULE_HEADERS],[SHEET_KINTAI,KINTAI_HEADERS],
    [SHEET_CONTACTS,CONTACT_HEADERS],[SHEET_SETTINGS,SETTINGS_HEADERS],
    [SHEET_APPLICATIONS,APPLICATION_HEADERS],[SHEET_LEAVE,LEAVE_HEADERS],
    [SHEET_AUDIT,AUDIT_HEADERS],[SHEET_NOTES,NOTE_HEADERS],[SHEET_COSTS,COST_HEADERS],
    [SHEET_VEHICLES,VEHICLE_HEADERS],[SHEET_SUPPLIERS,SUPPLIER_HEADERS],
    [SHEET_EST,EST_HEADERS],[SHEET_TOOLS,TOOL_HEADERS],[SHEET_TOOLLEND,TOOLLEND_HEADERS],
    [SHEET_PRODUCTS,PRODUCT_HEADERS],[SHEET_ORDERS,ORDER_HEADERS],[SHEET_STOCKLOG,STOCKLOG_HEADERS],
    [SHEET_DAIKO,DAIKO_HEADERS],[SHEET_DOCS,DOC_HEADERS]
  ];
}
function versionInfo_(){
  return {
    ok:true,
    version:'v143-login-header-fix',
    appVersion:'v2026.06.20-43.8.3',
    gasFile:'Code_v143.gs',
    build:'20260620-v43-8-3-cache-lock',
    companyName:COMPANY_NAME,
    time:new Date().toISOString(),
    changes:[
      '材料系AI action不足を補修',
      'Code_v143.gsへ更新',
      '販売前・お客様引き渡し前の確認項目を整理',
      'チェック進捗の保存・進捗率表示に対応',
      '引き渡しメモコピーと印刷に対応',
      '運用センターから導入チェックへ移動できるように改善'
    ]
  };
}

function setupStatus_(){
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var rows=[], missingSheets=0, missingColumns=0, totalRows=0;
  setupSheetPairs_().forEach(function(p){
    var name=p[0], headers=p[1], sh=ss.getSheetByName(name);
    if(!sh){ missingSheets++; missingColumns+=headers.length; rows.push({name:name,ok:false,exists:false,rows:0,missing:headers,missingCount:headers.length}); return; }
    var lastCol=Math.max(1,sh.getLastColumn());
    var cur=sh.getRange(1,1,1,lastCol).getValues()[0].map(function(v){return String(v||'').trim();});
    var miss=headers.filter(function(h){return cur.indexOf(h)<0;});
    if(miss.length) missingColumns+=miss.length;
    var dataRows=Math.max(0,sh.getLastRow()-1); totalRows+=dataRows;
    rows.push({name:name,ok:miss.length===0,exists:true,rows:dataRows,missing:miss,missingCount:miss.length});
  });
  var parentUrl='', parentId='', parentExists=false;
  try{
    var it=DriveApp.getFoldersByName(PARENT_FOLDER_NAME);
    if(it.hasNext()){ var f=it.next(); parentExists=true; parentUrl=f.getUrl(); parentId=f.getId(); }
  }catch(e){}
  var backup={enabled:false};
  try{ backup=backupTriggerStatus_(); }catch(e){ backup={enabled:false,error:String(e)}; }
  var settings={};
  try{ settings=getSettings_(); }catch(e){}
  return {
    version:'v143-login-header-fix',
    appVersion:'v2026.06.20-43.8.3',
    gasFile:'Code_v143.gs',
    companyName:COMPANY_NAME,
    parentFolderName:PARENT_FOLDER_NAME,
    parentFolderExists:parentExists,
    parentFolderUrl:parentUrl,
    parentFolderId:parentId,
    spreadsheetName:ss.getName(),
    spreadsheetUrl:ss.getUrl(),
    timeZone:Session.getScriptTimeZone(),
    settings:settings,
    backup:backup,
    sheets:rows,
    summary:{sheetCount:rows.length,missingSheets:missingSheets,missingColumns:missingColumns,totalRows:totalRows,ok:(missingSheets===0&&missingColumns===0&&parentExists)},
    serverTime:new Date().toISOString()
  };
}
function setupRepair_(){
  setupGenba();
  return setupStatus_();
}

function setupWizardSave_(data){
  var allow=['会社名','代表者名','会社郵便番号','会社住所','会社電話','会社FAX','インボイス登録番号','振込先','建設業許可番号','許可業種','社名上段','社名下段','支払条件','見積有効日数'];
  var out={};
  for(var i=0;i<allow.length;i++){ var k=allow[i]; if(data&&data.hasOwnProperty(k)) out[k]=data[k]; }
  saveSettings_(out);
  return setupStatus_();
}
function setupBackupDisable_(){
  var trgs=ScriptApp.getProjectTriggers(), n=0;
  for(var i=0;i<trgs.length;i++){ var h=trgs[i].getHandlerFunction(); if(h==='weeklyBackup'||h==='dailyBackup'){ ScriptApp.deleteTrigger(trgs[i]); n++; } }
  return {ok:true,removed:n};
}


function diagnosisStatus_(secret){
  var started=new Date();
  var out={ok:true,version:'v143-login-header-fix',appVersion:'v2026.06.20-43.8.3',gasFile:'Code_v143.gs',build:'20260620-v43-8-3-cache-lock',serverTime:started.toISOString(),checks:[],summary:{ok:0,warn:0,ng:0}};
  function add(id,title,status,detail,fix,data){
    status=status||'ok';
    out.checks.push({id:id,title:title,status:status,detail:String(detail||''),fix:String(fix||''),data:data||null});
    if(!out.summary[status]) out.summary[status]=0;
    out.summary[status]++;
  }
  try{
    var ss=SpreadsheetApp.getActiveSpreadsheet();
    add('gas','GAS接続','ok','GASへ接続できています。','');
    add('version','GASバージョン','ok','Code_v143.gs / v2026.06.20-43.8.3 で応答しています。','GitHub側の表示バージョンと一致しているか確認してください。',{gasFile:'Code_v143.gs',appVersion:'v2026.06.20-43.8.3'});
    add('spreadsheet','スプレッドシート','ok','接続先: '+ss.getName(),'この名前が導入先の管理シートと違う場合は、GASプロジェクトの紐付けを確認してください。',{name:ss.getName(),url:ss.getUrl(),id:ss.getId()});
    try{ add('timezone','タイムゾーン','ok',Session.getScriptTimeZone(),'日本時間でない場合は Apps Script のプロジェクト設定を確認してください。'); }catch(e){ add('timezone','タイムゾーン','warn',String(e),'Apps Script のプロジェクト設定を確認してください。'); }

    var st=setupStatus_();
    if(st.summary&&st.summary.missingSheets===0&&st.summary.missingColumns===0){
      add('sheets','必要シート・列','ok','必要なシート・列は揃っています。','');
    }else{
      add('sheets','必要シート・列','warn','不足シート '+(st.summary?st.summary.missingSheets:0)+' 件 / 不足列 '+(st.summary?st.summary.missingColumns:0)+' 件','初期設定ウィザードの「不足シート・不足列を修復」を実行してください。',st.summary||{});
    }
    if(st.parentFolderExists){
      add('driveParent','Drive親フォルダ','ok','親フォルダがあります: '+st.parentFolderName,'', {url:st.parentFolderUrl,id:st.parentFolderId});
    }else{
      add('driveParent','Drive親フォルダ','warn','親フォルダが見つかりません: '+st.parentFolderName,'初期設定ウィザードでDrive親フォルダを準備してください。');
    }
    try{
      var wsh=ss.getSheetByName(SHEET_WORKERS);
      if(wsh){
        ensureColumns_(wsh,WORKER_HEADERS);
        var last=wsh.getLastRow(), total=Math.max(0,last-1), active=0, stopped=0, admin=0, missingLogin=0, plainPw=0, hashPw=0;
        if(last>=2){
          var rows=wsh.getRange(2,1,last-1,WORKER_HEADERS.length).getValues();
          var ixLogin=WORKER_HEADERS.indexOf('ログインID'), ixPw=WORKER_HEADERS.indexOf('パスワード'), ixHash=WORKER_HEADERS.indexOf('パスワードハッシュ'), ixRole=WORKER_HEADERS.indexOf('権限'), ixState=WORKER_HEADERS.indexOf('利用状態');
          rows.forEach(function(r){
            var state=String(r[ixState]||'');
            if(/停止|退職|無効/.test(state)) stopped++; else active++;
            if(String(r[ixRole]||'').indexOf('管理')>=0) admin++;
            if(!String(r[ixLogin]||'').trim()) missingLogin++;
            if(String(r[ixPw]||'').trim()) plainPw++;
            if(String(r[ixHash]||'').trim()) hashPw++;
          });
        }
        add('workers','作業員ログイン設定',(missingLogin||plainPw)?'warn':'ok','作業員 '+total+'名 / 有効 '+active+'名 / 管理者 '+admin+'名 / ログインID未設定 '+missingLogin+'名 / 平文パスワード残り '+plainPw+'件','平文パスワードが残っている場合は、ログイン成功後または管理画面で再設定してハッシュ化してください。',{total:total,active:active,stopped:stopped,admin:admin,missingLogin:missingLogin,plainPw:plainPw,hashPw:hashPw});
      }else add('workers','作業員ログイン設定','ng','作業員マスタがありません。','初期設定ウィザードで修復してください。');
    }catch(e){ add('workers','作業員ログイン設定','ng',String(e),'作業員マスタの列名を確認してください。'); }

    try{
      var psh=ss.getSheetByName(SHEET_PROJECTS);
      if(psh){
        ensureColumns_(psh,PROJECT_HEADERS);
        var plast=psh.getLastRow(), ptotal=Math.max(0,plast-1), noDrive=0, activeP=0;
        if(plast>=2){
          var prows=psh.getRange(2,1,plast-1,PROJECT_HEADERS.length).getValues();
          var ixName=PROJECT_HEADERS.indexOf('案件名'), ixDrive=PROJECT_HEADERS.indexOf('Driveフォルダ'), ixStatus=PROJECT_HEADERS.indexOf('ステータス');
          prows.forEach(function(r){ if(String(r[ixName]||'').trim()){ if(!/完了|中止|失注/.test(String(r[ixStatus]||''))) activeP++; if(!String(r[ixDrive]||'').trim()) noDrive++; } });
        }
        add('projects','案件・Driveフォルダ',noDrive?'warn':'ok','案件 '+ptotal+'件 / 進行中目安 '+activeP+'件 / Driveフォルダ未設定 '+noDrive+'件','未設定が多い場合は、ファイル画面で現場を開くか、初期設定ウィザードでDrive準備を実行してください。',{total:ptotal,active:activeP,noDrive:noDrive});
      }else add('projects','案件・Driveフォルダ','ng','案件マスタがありません。','初期設定ウィザードで修復してください。');
    }catch(e){ add('projects','案件・Driveフォルダ','ng',String(e),'案件マスタの列名を確認してください。'); }

    try{
      var b=backupTriggerStatus_();
      add('backup','自動バックアップ',b&&b.enabled?'ok':'warn',b&&b.enabled?'自動バックアップが有効です。':'自動バックアップが無効です。','初期設定ウィザードで有効化できます。',b||{});
    }catch(e){ add('backup','自動バックアップ','warn',String(e),'初期設定ウィザードで再設定してください。'); }

    try{
      var sess=sessionInfo_(secret);
      add('session','ログインセッション',sess?'ok':'warn',sess?'有効なセッションです。':'セッション情報を確認できません。','ログインし直してください。',sess?{role:sess.role,expiresAt:sess.expiresAt}:{});
    }catch(e){ add('session','ログインセッション','warn',String(e),'ログインし直してください。'); }

    out.setup=st;
    out.ok=out.summary.ng===0;
    return out;
  }catch(e){
    add('fatal','診断処理','ng',String(e),'GASの保存・再デプロイ、または権限承認を確認してください。');
    out.ok=false;
    return out;
  }
}


/* ===== v40 ダッシュボード（ルートメニュー用） ===== */
function dashboard_(wid){
  var tz=Session.getScriptTimeZone();
  var today=Utilities.formatDate(new Date(),tz,'yyyy-MM-dd');
  function d10(v){ if(!v)return ''; if(v instanceof Date)return Utilities.formatDate(v,tz,'yyyy-MM-dd');
    return String(v).slice(0,10).replace(/\//g,'-'); }
  // 今日の予定
  var sch=listSchedules_().filter(function(x){ var a=d10(x['日付']); if(!a)return false;
      var b=d10(x['終了日'])||a; return today>=a&&today<=b; })
    .map(function(x){ return {'案件ID':x['案件ID'],'案件名':x['案件名'],'予定内容':x['予定内容'],
      '開始':x['開始'],'終了':x['終了'],'担当':x['担当'],'区分':x['区分']}; })
    .sort(function(a,b){return String(a['開始']||'').localeCompare(String(b['開始']||''));});
  // 今日の日報（自社作業員の提出状況）
  var repWids={};
  listReports_().forEach(function(r){ if(d10(r['日付'])===today)repWids[String(r['作業員ID'])]=1; });
  var own=listWorkers_().filter(function(w){return String(w['区分']||'').indexOf('協力')<0;})
    .map(function(w){return {'作業員ID':w['作業員ID'],'氏名':w['氏名']||'','略称':w['略称']||'',
      '提出':repWids[String(w['作業員ID'])]?1:0};});
  // 案件ステータス集計
  var pc={};
  listProjects_().forEach(function(p){ var st=String(p['ステータス']||'').trim(); if(st)pc[st]=(pc[st]||0)+1; });
  // 車両アラート（車検・保険＝30日前から／オイル＝14日前から）
  var alerts=[]; var now=new Date(); now.setHours(0,0,0,0);
  function daysTo(v){ var t=d10(v); if(!t)return null; var d=new Date(t+'T00:00:00');
    if(isNaN(d.getTime()))return null; return Math.round((d.getTime()-now.getTime())/86400000); }
  listVehicles_().forEach(function(v){
    var nm=v['車両名']||v['ナンバー']||'';
    var sk=daysTo(v['車検満了日']); if(sk!==null&&sk<=30)alerts.push({'車両名':nm,'種類':'車検','期日':d10(v['車検満了日']),'残':sk});
    var hk=daysTo(v['保険満了日']); if(hk!==null&&hk<=30)alerts.push({'車両名':nm,'種類':'保険','期日':d10(v['保険満了日']),'残':hk});
    var base=d10(v['前回オイル交換日']), mon=parseInt(v['オイル交換月数'],10);
    if(base&&mon>0){ var bd=new Date(base+'T00:00:00');
      if(!isNaN(bd.getTime())){ bd.setMonth(bd.getMonth()+mon);
        var od=Math.round((bd.getTime()-now.getTime())/86400000);
        if(od<=14)alerts.push({'車両名':nm,'種類':'オイル交換','期日':Utilities.formatDate(bd,tz,'yyyy-MM-dd'),'残':od}); } }
  });
  alerts.sort(function(a,b){return a['残']-b['残'];});
  // 〔v42〕工期間近の案件（完了以外で、工期完了が7日以内または超過）
  var due=[];
  listProjects_().forEach(function(p){
    var st2=String(p['ステータス']||'').trim();
    if(st2==='完了')return;
    var dd=daysTo(p['工期完了']); if(dd===null)return;
    if(dd<=7)due.push({'案件ID':p['案件ID'],'案件名':p['案件名'],'期日':d10(p['工期完了']),'残':dd});
  });
  due.sort(function(a,b){return a['残']-b['残'];});
  // 〔v42〕未完了チェックリスト（ツールボックスのチェックリストで未完了項目が残っているもの）
  var pmap={}; listProjects_().forEach(function(p){pmap[String(p['案件ID'])]=p['案件名'];});
  var checks=[];
  readAll_(SHEET_NOTES,NOTE_HEADERS,'メモID').forEach(function(n){
    if(String(n['種類'])!=='check')return;
    var its=[]; try{its=JSON.parse(n['内容']||'[]');}catch(e){}
    var undone=0,totalN=0;
    its.forEach(function(it){ if(it&&String(it.t||'').trim()){totalN++; if(!it.d)undone++;} });
    if(undone>0)checks.push({'タイトル':n['タイトル']||'(無題)','案件名':pmap[String(n['案件ID'])]||'',
      '残':undone,'全':totalN,'更新':String(n['更新日時']||'')});
  });
  checks.sort(function(a,b){return b['更新'].localeCompare(a['更新']);});
  var checkTotal=checks.length; checks=checks.slice(0,5);
  // 〔v42〕自分の勤怠（widが指定された場合のみ）
  var me=null;
  if(wid){
    var ym=today.slice(0,7), days={}, status='未出勤', since='';
    readAll_(SHEET_KINTAI,KINTAI_HEADERS,'勤怠ID').forEach(function(k){
      if(String(k['作業員ID'])!==String(wid))return;
      var dt=d10(k['日付']); if(!dt)return;
      if(dt.slice(0,7)===ym && String(k['出勤']||''))days[dt]=1;
      if(dt===today && String(k['出勤']||'')){
        if(!String(k['退勤']||'')){status='出勤中';since=String(k['出勤']).slice(0,5);}
        else if(status!=='出勤中'){status='退勤済';}
      }
    });
    me={'状態':status,'出勤':since,'今月出勤日数':Object.keys(days).length};
  }
  // 〔v43〕売掛サマリー（請求書の未入金）
  var arSum=0, arCnt=0, arOver=0;
  readAll_(SHEET_EST,EST_HEADERS,'伝票ID').forEach(function(e){
    if(String(e['種別'])!=='請求'||String(e['状態'])!=='未入金')return;
    arSum+=numv_(e['合計']); arCnt++;
    var dl=d10(e['期限']); if(dl&&dl<today)arOver++;
  });
  var ar={'未入金額':arSum,'未入金件数':arCnt,'期限超過':arOver};
  return {today:today,schedules:sch,workers:own,projCounts:pc,vehicleAlerts:alerts,
    dueProjects:due,checklists:checks,checklistTotal:checkTotal,me:me,ar:ar};
}


// ===== 見積書・請求書（v41）=====
function listEst_(){ return readAll_(SHEET_EST,EST_HEADERS,'伝票ID'); }
// 〔v43〕入金記録：paid='1'で入金済＋入金日、それ以外で未入金に戻す
function estMarkPaid_(id,date,paid){
  var sh=sheet_(SHEET_EST); ensureColumns_(sh,EST_HEADERS);
  var r=findRow_(sh,'伝票ID',id); if(r<0)throw'伝票が見つかりません';
  var rec=rowToObj_(sh,r,EST_HEADERS);
  if(String(paid)==='1'||paid===true||paid===undefined){ rec['状態']='入金済'; rec['入金日']=date||ymd_(); }
  else { rec['状態']='未入金'; rec['入金日']=''; }
  rec['更新日時']=new Date();
  sh.getRange(r,1,1,EST_HEADERS.length).setValues([EST_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
  return readObj_(rec);
}
// 伝票番号の自動採番：見積=M0001〜 / 請求=S0001〜（既存の最大値+1）
function nextEstNo_(type){ var pre=(String(type)==='請求')?'S':'M';
  var all=readAll_(SHEET_EST,EST_HEADERS,'伝票ID'),mx=0;
  all.forEach(function(o){ var no=String(o['伝票番号']||''); if(no.charAt(0)===pre){ var n=parseInt(no.slice(1),10); if(!isNaN(n)&&n>mx)mx=n; } });
  return pre+('0000'+(mx+1)).slice(-4); }
// 〔v46〕案件ステータスを控えめに進める（後退はしない）
var STATUS_ORDER_={'見積中':1,'受注':2,'段取済':3,'施工中':4,'完了':5,'請求済':6};
function advanceProjectStatus_(caseId,target){
  if(!caseId)return;
  try{
    var sh=sheet_(SHEET_PROJECTS),r=findRow_(sh,'案件ID',caseId); if(r<0)return;
    var obj=rowToObj_(sh,r,PROJECT_HEADERS), cur=String(obj['ステータス']||'').trim();
    var co=STATUS_ORDER_[cur]||0, to=STATUS_ORDER_[target]||0;
    // 「完了」より手前のときだけ請求済へ進める（完了済みは尊重）。空なら設定。
    if(target==='請求済'){ if(cur===''||co<6){ setProjectField_(sh,r,'ステータス','請求済'); } return; }
    if(co===0 && to>0){ setProjectField_(sh,r,'ステータス',target); }
  }catch(e){}
}
function estSave_(data){ var sh=sheet_(SHEET_EST); ensureColumns_(sh,EST_HEADERS); var now=new Date();
  // 金額はサーバー側で再計算（改ざん・計算ズレ防止）
  var items=[]; try{ items=JSON.parse(data['明細']||'[]'); }catch(e){ items=[]; }
  var sub=0; items.forEach(function(it){ sub+=Math.round(numv_(it.q)*numv_(it.p)); });
  var tax=Math.floor(sub*0.10), total=sub+tax;
  data['小計']=sub; data['消費税']=tax; data['合計']=total;
  if(data['伝票ID']){ var r=findRow_(sh,'伝票ID',data['伝票ID']); if(r<0)throw'伝票が見つかりません: '+data['伝票ID'];
    var rec=merge_(rowToObj_(sh,r,EST_HEADERS),data); rec['更新日時']=now;
    sh.getRange(r,1,1,EST_HEADERS.length).setValues([EST_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);
    return readObj_(rec); }
  var id=uid_('E'); var rec2=merge_(blank_(EST_HEADERS),data); rec2['伝票ID']=id;
  if(!rec2['伝票番号'])rec2['伝票番号']=nextEstNo_(rec2['種別']);
  if(!rec2['状態'])rec2['状態']=(String(rec2['種別'])==='請求')?'未入金':'見積中';
  rec2['登録日時']=now; rec2['更新日時']=now;
  sh.appendRow(EST_HEADERS.map(function(h){return rec2[h]!==undefined?rec2[h]:'';}));
  if(String(rec2['種別'])==='請求') advanceProjectStatus_(rec2['案件ID'],'請求済');
  return readObj_(rec2); }
function estDelete_(id,secret){ return softDeleteById_(SHEET_EST,'伝票ID',id,secret); }
function yen_(n){ n=Math.round(numv_(n)); var s=String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,','); return (n<0?'-¥':'¥')+s; }
// PDF生成：一時スプレッドシートを組み立て → A4縦でPDFエクスポート → 案件フォルダ/見積請求 へ保存
function estPdf_(id, tax){
  var sh=sheet_(SHEET_EST),r=findRow_(sh,'伝票ID',id); if(r<0)throw'伝票が見つかりません';
  var rec=rowToObj_(sh,r,EST_HEADERS), st=getSettings_();
  var isInv=(String(rec['種別'])==='請求');
  // 税区分（'in'=税込 / 'out'=税抜）。未指定なら 見積=税抜 / 請求=税込
  var taxMode=(tax==='in'||tax==='out')?tax:(isInv?'in':'out');
  var items=[]; try{ items=JSON.parse(rec['明細']||'[]'); }catch(e){}
  // テンプレート（Googleスプレッドシート）を複製して差し込む
  var tpl=findEstTemplate_(isInv);
  var copy=tpl.makeCopy('tmp_'+rec['伝票番号']+'_'+Date.now());
  var ss=SpreadsheetApp.openById(copy.getId());
  // コピー側の入力規則（品名・単位等のドロップダウン）を解除（一覧外の値で弾かれるのを防ぐ）。元テンプレは不変
  ss.getSheets().forEach(function(shx){ try{ shx.getRange(1,1,shx.getMaxRows(),shx.getMaxColumns()).clearDataValidations(); }catch(e){} });
  // 目印 {{ }} を管理画面の設定＋伝票データで差し替え
  var addr=(st['会社郵便番号']?'〒'+st['会社郵便番号']+' ':'')+(st['会社住所']||'');
  var telfax=(st['会社電話']?'TEL '+st['会社電話']:'')+(st['会社FAX']?(st['会社電話']?'\u3000':'')+'FAX '+st['会社FAX']:'');
  var map={
    'No':rec['伝票番号'], '日付':warekiStr_(rec['発行日']||ymd_()), '宛名':rec['宛名'],
    '業種':st['社名上段'], '会社名':st['会社名'], '代表者':st['社名下段'],
    '住所':addr, 'TEL_FAX':telfax, '登録番号':st['インボイス登録番号'], '振込先':st['振込先'],
    '担当':rec['担当'], '工事名':rec['案件名'], '工事場所':rec['件名'], '備考':rec['備考']
  };
  // 金額エリア（右上）の3行を税区分で出し分け。yen_ は ¥#,##0 形式
  var subT=numv_(rec['小計']), taxT=numv_(rec['消費税']), totT=numv_(rec['合計']);
  if(taxMode==='in'){
    map['金額ラベル1']='小　計';        map['金額値1']=yen_(subT);
    map['金額ラベル2']='消費税（10%）';  map['金額値2']=yen_(taxT);
    map['金額ラベル3']='合計（税込）';    map['金額値3']=yen_(totT)+'-';
  }else{
    map['金額ラベル1']='金　額';  map['金額値1']=yen_(subT)+'-';
    map['金額ラベル2']='';        map['金額値2']='';
    map['金額ラベル3']='';        map['金額値3']='';
    map['備考']='消費税は含まれておりません'+(rec['備考']?'　'+String(rec['備考']):'');
  }
  for(var k in map){ if(map.hasOwnProperty(k)){ ss.createTextFinder('{{'+k+'}}').replaceAllWith(map[k]==null?'':String(map[k])); } }
  // 明細を流し込み（見積は1ページに収まらない分だけ「内訳」へ）
  var overflow=false, main;
  if(isInv){ main=ss.getSheetByName('請求')||ss.getSheets()[0]; fillEstDetail_(main,items,17,47); }
  else{
    main=ss.getSheetByName('見積1')||ss.getSheets()[0];
    var cap1=30; // 見積1（表紙）の明細：17〜46行（表紙レイアウト固定）
    fillEstDetail_(main, items.slice(0,cap1), 17, 46);
    var sub=ss.getSheetByName('内訳');
    // 31行目以降は内訳シートへ。多い場合は内訳の行を自動拡張して全件出力（複数ページ対応）v97
    if(items.length>cap1 && sub){
      fillEstDetailGrow_(sub, items.slice(cap1), 5, 45);
      overflow=true;
      // 内訳シートのA・B列（明細を流し込んでいない空列）を削除してA4幅で左寄せに（v98）
      // テンプレ本体ではなくコピー側を編集しているので安全
      try{
        if(sub.getMaxColumns() >= 2){ sub.deleteColumns(1, 2); }
      }catch(e){}
    }
  }
  // あいさつ文（左・行7-8）。管理画面『あいさつ文』を使用、無ければ既定文
  var greet=String(st['あいさつ文']||'');
  var gl=greet?greet.split(/\r?\n/):['下記の通り'+(isInv?'御請求':'御見積')+'申し上げます。','何卒ご用命賜ります様お願い申し上げます。'];
  for(var gi=0;gi<2;gi++){ try{ main.getRange(7+gi,3).setValue(gl[gi]||'').setFontSize(10.5).setHorizontalAlignment('left').setVerticalAlignment('middle'); }catch(e){} }
  // 税抜のときは金額エリア2・3行目の下罫線を消す（工事名上の余分な2本線を除去）
  if(taxMode==='out'){ try{ main.getRange(11,3,2,4).setBorder(null,null,false,null,null,false,null,null); }catch(e){} }
  SpreadsheetApp.flush();
  // PDF出力（A4縦・幅フィット）。見積のオーバーフロー時のみ全シート、通常は主シートのみ
  var base='https://docs.google.com/spreadsheets/d/'+ss.getId()+'/export?format=pdf&size=A4&portrait=true&fitw=true&fith=true&gridlines=false&printtitle=false&sheetnames=false&top_margin=0.3&bottom_margin=0.3&left_margin=0.3&right_margin=0.3';
  var url = overflow ? base : (base+'&gid='+main.getSheetId());
  var resp=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  var dest = rec['案件ID'] ? ensureSub_(getCaseFolder_(rec['案件ID']),'見積請求') : ensureSub_(getParent_(),'見積請求');
  var safe=String(rec['宛名']||'').replace(/[\/\\:*?"<>|]/g,'').replace(/\s+$/,'');
  var taxTag=(taxMode==='in')?'_税込':'_税抜';
  var outName=(isInv?'請求書':'見積書')+'_'+rec['伝票番号']+'_'+safe+taxTag+'_'+ymd_();
  var pf=dest.createFile(resp.getBlob().setName(outName+'.pdf'));
  try{pf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  try{DriveApp.getFileById(ss.getId()).setTrashed(true);}catch(e){}
  var pc=EST_HEADERS.indexOf('PDF')+1; if(pc>0)sh.getRange(r,pc).setValue(pf.getUrl());
  return {ok:true,pdfUrl:pf.getUrl(),name:outName+'.pdf'};
}
// 見積書／請求書テンプレート（Googleスプレッドシート）を名前で探す
function findEstTemplate_(isInv){
  var kw=isInv?'請求書':'見積書', want=kw+'テンプレート', cands=[];
  var it=DriveApp.searchFiles('mimeType="application/vnd.google-apps.spreadsheet" and title contains "'+kw+'" and title contains "テンプレート" and trashed=false');
  while(it.hasNext()){ var f=it.next(), nm=String(f.getName()||''); if(nm.indexOf(kw)>=0&&nm.indexOf('テンプレート')>=0) cands.push(f); }
  for(var i=0;i<cands.length;i++){ try{ var ssx=SpreadsheetApp.openById(cands[i].getId()); if(ssx&&ssx.getSheets().length>0) return cands[i]; }catch(e){} }
  throw '「'+want+'」という名前のGoogleスプレッドシートが見つかりません。ドライブに用意してください。';
}
// 明細を所定の行範囲に流し込み（C:品名 / H:数量 / I:単位 / J:単価 / K:金額）。金額＝数量×単価
function fillEstDetail_(sheet, items, startRow, endRow){
  if(!sheet||!items||!items.length)return 0;
  var max=endRow-startRow+1, n=Math.min(items.length,max);
  for(var i=0;i<n;i++){ var it=items[i]||{}, rr=startRow+i;
    var q=numv_(it.q), p=numv_(it.p), amt=Math.round(q*p);
    try{ sheet.getRange(rr,3,1,5).merge(); }catch(e){}   // C:G 品名を結合（テンプレの結合有無を統一）
    try{ sheet.getRange(rr,11,1,2).merge(); }catch(e){}  // K:L 金額を結合
    sheet.getRange(rr,3).setValue(it.n!=null?it.n:'');
    sheet.getRange(rr,8).setValue(q||'').setHorizontalAlignment('right').setNumberFormat('0.##');
    sheet.getRange(rr,9).setValue(it.u!=null?it.u:'').setHorizontalAlignment('center');
    sheet.getRange(rr,10).setValue(p||'').setHorizontalAlignment('right').setNumberFormat('#,##0');
    sheet.getRange(rr,11).setValue(amt||'').setHorizontalAlignment('right').setNumberFormat('#,##0');
  }
  return n;
}
// 明細を流し込み、行が足りなければ雛形行を複製して自動拡張する（内訳シート用・複数ページ対応） v97
// startRow〜baseEndRow が元テンプレの明細行範囲。items がそれより多ければ baseEndRow 行を雛形にして下へ行挿入する。
function fillEstDetailGrow_(sheet, items, startRow, baseEndRow){
  if(!sheet||!items||!items.length) return 0;
  var baseCap = baseEndRow - startRow + 1;     // テンプレ既定の明細行数
  var need = items.length;                      // 必要な明細行数
  // 行が足りない場合、雛形行(baseEndRow)を複製して不足分を挿入
  if(need > baseCap){
    var extra = need - baseCap;
    // 安全上限：暴走防止のため最大160行ぶんまで（テンプレ分含む）
    var EXTRA_MAX = 160 - baseCap; if(EXTRA_MAX < 0) EXTRA_MAX = 0;
    if(extra > EXTRA_MAX) extra = EXTRA_MAX;
    if(extra > 0){
      var tplRow = baseEndRow; // 雛形にする行（書式・罫線・結合を持つ最終明細行）
      // tplRow の直後に extra 行を挿入し、tplRow の書式をコピー
      sheet.insertRowsAfter(tplRow, extra);
      var tplRange = sheet.getRange(tplRow, 1, 1, sheet.getMaxColumns());
      var destRange = sheet.getRange(tplRow + 1, 1, extra, sheet.getMaxColumns());
      tplRange.copyTo(destRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      // 行の高さも雛形に合わせる
      try{
        var h = sheet.getRowHeight(tplRow);
        for(var rh = 0; rh < extra; rh++){ sheet.setRowHeight(tplRow + 1 + rh, h); }
      }catch(e){}
    }
  }
  // 値を流し込み（C:品名 結合 / H:数量 / I:単位 / J:単価 / K:L金額 結合）
  var n = items.length;
  var cap = baseCap + Math.max(0, (160 - baseCap)); // 拡張後の実上限
  if(n > cap) n = cap;
  for(var i = 0; i < n; i++){
    var it = items[i] || {}, rr = startRow + i;
    var q = numv_(it.q), p = numv_(it.p), amt = Math.round(q * p);
    try{ sheet.getRange(rr, 3, 1, 5).merge(); }catch(e){}
    try{ sheet.getRange(rr, 11, 1, 2).merge(); }catch(e){}
    sheet.getRange(rr, 3).setValue(it.n != null ? it.n : '');
    sheet.getRange(rr, 8).setValue(q || '').setHorizontalAlignment('right').setNumberFormat('0.##');
    sheet.getRange(rr, 9).setValue(it.u != null ? it.u : '').setHorizontalAlignment('center');
    sheet.getRange(rr, 10).setValue(p || '').setHorizontalAlignment('right').setNumberFormat('#,##0');
    sheet.getRange(rr, 11).setValue(amt || '').setHorizontalAlignment('right').setNumberFormat('#,##0');
  }
  return n;
}
// 西暦YYYY-MM-DD → 和暦の文字列（令和X年M月D日）。令和(2019-)のみ対応、それ以外は元の文字列を返す
function warekiStr_(ymd){ var t=String(ymd||''); var m=t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/); if(!m)return t;
  var y=+m[1],mo=+m[2],dd=+m[3]; if(y>=2019){ var r=y-2018; return '令和'+(r===1?'元':r)+'年'+mo+'月'+dd+'日'; } return t; }
// 帳票レイアウトの組み立て（A〜F列）
function buildEstSheet_(s,rec,st,items,title,isInv){
  // ===== 列幅（5列：品名/数量/単位/単価/金額。No.列なし＝サンプル準拠）=====
  if(s.getMaxColumns()>5)s.deleteColumns(6,s.getMaxColumns()-5);
  var widths=[330,54,44,116,130]; // A:品名 B:数量 C:単位 D:単価 E:金額
  for(var i=0;i<widths.length;i++)s.setColumnWidth(i+1,widths[i]);
  s.getRange('A1:E90').setFontFamily('Noto Sans JP').setFontSize(10.5).setVerticalAlignment('middle');

  // ===== ヘッダー：No.(左) / タイトル(中央) / P.(右) =====
  s.getRange('A1').setValue('No.　'+String(rec['伝票番号']||'')).setFontSize(11).setHorizontalAlignment('left');
  s.getRange('A1').setBorder(false,false,true,false,false,false,'#333333',SpreadsheetApp.BorderStyle.SOLID);
  s.getRange('E1').setValue('P.　1').setFontSize(11).setHorizontalAlignment('right');
  s.setRowHeight(1,20);
  s.getRange('A2:E2').merge().setValue(title).setFontSize(26).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  s.getRange('A2:E2').setBorder(false,false,true,false,false,false,'#333333',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  s.setRowHeight(2,40);

  // ===== 宛名(左・下線) / 和暦日付(右) =====
  s.getRange('A3').setValue(String(rec['宛名']||'')).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('left');
  s.getRange('A3').setBorder(false,false,true,false,false,false,'#333333',SpreadsheetApp.BorderStyle.SOLID);
  s.getRange('B3:E3').merge().setValue(warekiStr_(rec['発行日']||ymd_())).setFontSize(10.5).setHorizontalAlignment('right');
  s.setRowHeight(3,24);

  // ===== あいさつ文(左・2行。管理画面の設定『あいさつ文』を使用) =====
  var greet=String(st['あいさつ文']||'');
  var gl = greet ? greet.split(/\r?\n/) : ['下記の通り'+(isInv?'御請求':'御見積')+'申し上げます。','何卒ご用命賜ります様お願い申し上げます。'];
  s.getRange('A4').setValue(gl[0]||'').setFontSize(10).setHorizontalAlignment('left');
  s.getRange('A5').setValue(gl[1]||'').setFontSize(10).setHorizontalAlignment('left');
  s.setRowHeight(4,16); s.setRowHeight(5,18);

  // ===== 自社情報(右・B:E中央) =====
  var cr=4;
  if(st['社名上段']){ s.getRange('B'+cr+':E'+cr).merge().setValue(String(st['社名上段'])).setFontSize(9.5).setHorizontalAlignment('center'); cr++; }
  s.getRange('B'+cr+':E'+cr).merge().setValue(String(st['会社名']||'')).setFontSize(15).setFontWeight('bold').setHorizontalAlignment('center'); s.setRowHeight(cr,24); cr++;
  if(st['社名下段']){ s.getRange('B'+cr+':E'+cr).merge().setValue(String(st['社名下段'])).setFontSize(10).setHorizontalAlignment('center'); cr++; }
  var caddr=''; if(st['会社郵便番号'])caddr='〒'+st['会社郵便番号']; if(st['会社住所'])caddr+=(caddr?'　':'')+st['会社住所'];
  if(caddr){ s.getRange('B'+cr+':E'+cr).merge().setValue(caddr).setFontSize(9).setHorizontalAlignment('center'); cr++; }
  var tel=''; if(st['会社電話'])tel='TEL '+st['会社電話']; if(st['会社FAX'])tel+=(tel?'　':'')+'FAX '+st['会社FAX'];
  if(tel){ s.getRange('B'+cr+':E'+cr).merge().setValue(tel).setFontSize(9).setHorizontalAlignment('center'); cr++; }
  if(st['インボイス登録番号']){ s.getRange('B'+cr+':E'+cr).merge().setValue('登録番号 '+st['インボイス登録番号']).setFontSize(9).setHorizontalAlignment('center'); cr++; }

  // ===== 金額(左) ＋ 担当・印鑑枠2つ(右) =====
  var mr=Math.max(cr,7);
  var total=numv_(rec['合計']);
  s.getRange('A'+mr).setValue('金　額　　　'+yen_(total)).setFontSize(20).setFontWeight('bold').setHorizontalAlignment('left').setVerticalAlignment('middle');
  s.getRange('A'+mr).setBorder(false,false,true,false,false,false,'#333333',SpreadsheetApp.BorderStyle.SOLID);
  s.getRange('B'+mr+':C'+mr).merge().setValue('担当：'+String(rec['担当']||'')).setFontSize(10).setHorizontalAlignment('right').setVerticalAlignment('bottom');
  s.getRange('B'+mr+':C'+mr).setBorder(false,false,true,false,false,false,'#333333',SpreadsheetApp.BorderStyle.SOLID);
  s.getRange('D'+mr).setBorder(true,true,true,true,false,false,'#777777',SpreadsheetApp.BorderStyle.SOLID);
  s.getRange('E'+mr).setBorder(true,true,true,true,false,false,'#777777',SpreadsheetApp.BorderStyle.SOLID);
  s.setRowHeight(mr,46);

  // ===== 工事名/工事場所 ｜ 有効期限/備考（囲み枠）=====
  var months=Math.max(1,Math.round((parseInt(st['見積有効日数'],10)||30)/30));
  var r1=mr+1, r2=mr+2;
  s.getRange('A'+r1).setValue('工事名　'+String(rec['案件名']||'')).setFontSize(10).setHorizontalAlignment('left');
  s.getRange('B'+r1+':E'+r1).merge().setValue(isInv?('お支払期限　'+String(rec['期限']||'')):('有効期限　発行日より'+months+'ヶ月')).setFontSize(10).setHorizontalAlignment('left');
  s.getRange('A'+r2).setValue('工事場所　'+String(rec['件名']||'')).setFontSize(10).setHorizontalAlignment('left');
  s.getRange('B'+r2+':E'+r2).merge().setValue('備考　'+String(rec['備考']||'')).setFontSize(10).setHorizontalAlignment('left');
  s.setRowHeight(r1,22); s.setRowHeight(r2,22);
  s.getRange('A'+r1+':E'+r2).setBorder(true,true,true,true,true,true,'#666666',SpreadsheetApp.BorderStyle.SOLID);

  // ===== 明細表 =====
  var hr=r2+1;
  s.getRange('A'+hr).setValue('品 名 及 び 仕 様');
  s.getRange('B'+hr).setValue('数 量');
  s.getRange('C'+hr).setValue('単位');
  s.getRange('D'+hr).setValue('単 価');
  s.getRange('E'+hr).setValue('金 額');
  s.getRange('A'+hr+':E'+hr).setFontWeight('bold').setHorizontalAlignment('center').setFontSize(10.5);
  s.setRowHeight(hr,24);
  var rows=Math.max(items.length,22);
  var body=[];
  for(var ri=0;ri<rows;ri++){ var it=items[ri];
    if(it){ var amt=Math.round(numv_(it.q)*numv_(it.p)); body.push([String(it.n||''), numv_(it.q)||'', String(it.u||''), numv_(it.p)||'', amt||'']); }
    else body.push(['','','','','']); }
  s.getRange(hr+1,1,rows,5).setValues(body).setFontSize(10.5);
  s.getRange(hr+1,1,rows,1).setHorizontalAlignment('left');
  s.getRange(hr+1,2,rows,1).setHorizontalAlignment('right').setNumberFormat('0.##');
  s.getRange(hr+1,3,rows,1).setHorizontalAlignment('center');
  s.getRange(hr+1,4,rows,1).setHorizontalAlignment('right').setNumberFormat('#,##0');
  s.getRange(hr+1,5,rows,1).setHorizontalAlignment('right').setNumberFormat('#,##0');
  for(var rr=hr+1;rr<=hr+rows;rr++)s.setRowHeight(rr,22);

  // ===== 合計欄（税込：小計/消費税/合計。税抜は第2段階）=====
  var tr=hr+rows+1;
  var sums=[['小　計',numv_(rec['小計'])],['消費税（10%）',numv_(rec['消費税'])],['合　計',numv_(rec['合計'])]];
  for(var si=0;si<3;si++){
    s.getRange('A'+(tr+si)+':D'+(tr+si)).merge().setValue(sums[si][0]).setFontSize(11).setHorizontalAlignment('center').setVerticalAlignment('middle');
    s.getRange('E'+(tr+si)).setValue(sums[si][1]).setNumberFormat('#,##0').setHorizontalAlignment('right').setFontSize(11);
    s.setRowHeight(tr+si,24);
  }
  s.getRange('A'+(tr+2)+':E'+(tr+2)).setFontWeight('bold');
  s.getRange(hr,1,rows+4,5).setBorder(true,true,true,true,true,true,'#666666',SpreadsheetApp.BorderStyle.SOLID);

  // ===== 振込先（請求書のみ）=====
  var nr=tr+4;
  if(isInv&&st['振込先']){
    s.getRange('A'+nr).setValue('お振込先').setFontWeight('bold').setFontSize(10);
    s.getRange('A'+(nr+1)+':E'+(nr+2)).merge().setValue(String(st['振込先'])).setFontSize(10).setVerticalAlignment('top').setWrap(true);
    s.getRange('A'+nr+':E'+(nr+2)).setBorder(true,true,true,true,false,false,'#999999',SpreadsheetApp.BorderStyle.SOLID);
  }
}


// 〔v80〕見積・請求の Excel（帳票版）出力：PDFと同じ整形シート(buildEstSheet_)をxlsxで書き出し（罫線・体裁を完全再現）
function estXlsx_(id){
  var sh=sheet_(SHEET_EST),r=findRow_(sh,'伝票ID',id); if(r<0)throw'伝票が見つかりません';
  var rec=rowToObj_(sh,r,EST_HEADERS), st=getSettings_();
  var isInv=(String(rec['種別'])==='請求');
  var title=isInv?'御 請 求 書':'御 見 積 書';
  var items=[]; try{ items=JSON.parse(rec['明細']||'[]'); }catch(e){}
  var ssNew=SpreadsheetApp.create('tmp_x_'+rec['伝票番号']+'_'+Date.now());
  var s=ssNew.getSheets()[0];
  buildEstSheet_(s,rec,st,items,title,isInv);
  SpreadsheetApp.flush();
  var url='https://docs.google.com/spreadsheets/d/'+ssNew.getId()+'/export?format=xlsx';
  var resp=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  var dest = rec['案件ID'] ? ensureSub_(getCaseFolder_(rec['案件ID']),'見積請求') : ensureSub_(getParent_(),'見積請求');
  var safe=String(rec['宛名']||'').replace(/[\/\\:*?"<>|]/g,'').replace(/\s+$/,'');
  var outName=(isInv?'請求書':'見積書')+'_'+rec['伝票番号']+'_'+safe+'_'+ymd_();
  var xf=dest.createFile(resp.getBlob().setName(outName+'.xlsx'));
  try{xf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  try{DriveApp.getFileById(ssNew.getId()).setTrashed(true);}catch(e){}
  var pc=EST_HEADERS.indexOf('PDF')+1; // PDF列があれば最新出力としてxlsxは別管理（PDF列は上書きしない）
  return {ok:true,fileUrl:xf.getUrl(),name:outName+'.xlsx'};
}

// 〔v80〕見積・請求の CSV 出力：伝票情報＋明細＋合計をUTF-8(BOM付)で。Excelで文字化けせず、金額は数値のまま
function estCsv_(id){
  var sh=sheet_(SHEET_EST),r=findRow_(sh,'伝票ID',id); if(r<0)throw'伝票が見つかりません';
  var rec=rowToObj_(sh,r,EST_HEADERS);
  var isInv=(String(rec['種別'])==='請求');
  var items=[]; try{ items=JSON.parse(rec['明細']||'[]'); }catch(e){}
  function c_(v){ var t=String(v==null?'':v); if(/[",\r\n]/.test(t))t='"'+t.replace(/"/g,'""')+'"'; return t; }
  function row_(arr){ return arr.map(c_).join(','); }
  var L=[];
  L.push(row_(['種別','伝票番号','発行日','宛名','件名','工事場所','期限']));
  L.push(row_([isInv?'請求':'見積',rec['伝票番号']||'',rec['発行日']||'',rec['宛名']||'',rec['件名']||'',rec['案件名']||'',rec['期限']||'']));
  L.push('');
  L.push(row_(['No.','品名・仕様','数量','単位','単価','金額']));
  for(var i=0;i<items.length;i++){ var it=items[i]||{};
    var q=numv_(it.q),p=numv_(it.p);
    L.push(row_([i+1,it.n||'',q||'',it.u||'',p||'',Math.round(q*p)||'']));
  }
  L.push('');
  L.push(row_(['','','','','小計',numv_(rec['小計'])]));
  L.push(row_(['','','','','消費税(10%)',numv_(rec['消費税'])]));
  L.push(row_(['','','','','合計(税込)',numv_(rec['合計'])]));
  var csv='\uFEFF'+L.join('\r\n');
  var dest = rec['案件ID'] ? ensureSub_(getCaseFolder_(rec['案件ID']),'見積請求') : ensureSub_(getParent_(),'見積請求');
  var safe=String(rec['宛名']||'').replace(/[\/\\:*?"<>|]/g,'').replace(/\s+$/,'');
  var outName=(isInv?'請求書':'見積書')+'_'+rec['伝票番号']+'_'+safe+'_'+ymd_();
  var cf=dest.createFile(Utilities.newBlob(csv,'text/csv',outName+'.csv'));
  try{cf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  return {ok:true,fileUrl:cf.getUrl(),name:outName+'.csv'};
}

// ===== 安全書類：作業員名簿（v58）全建統一様式第5号 =====
// Driveのテンプレートxlsxにデータを流し込みPDF出力
function Drive_create_(blob,name,destFolder){
  // xlsxブロブをGoogleスプレッドシートに変換してDriveに作成（Drive REST API直叩き＝高度サービス不要）
  var meta={name:name,mimeType:'application/vnd.google-apps.spreadsheet'};
  if(destFolder){ meta.parents=[destFolder.getId()]; }
  var boundary='xxBOUNDARYxx'+Date.now();
  var payload=Utilities.newBlob(
    '--'+boundary+'\r\n'+
    'Content-Type: application/json; charset=UTF-8\r\n\r\n'+
    JSON.stringify(meta)+'\r\n'+
    '--'+boundary+'\r\n'+
    'Content-Type: '+blob.getContentType()+'\r\n\r\n'
  ).getBytes()
   .concat(blob.getBytes())
   .concat(Utilities.newBlob('\r\n--'+boundary+'--').getBytes());
  var resp=UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',{
    method:'post',
    contentType:'multipart/related; boundary='+boundary,
    payload:payload,
    headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},
    muteHttpExceptions:true
  });
  var obj=JSON.parse(resp.getContentText());
  if(!obj.id)throw 'スプレッドシート変換に失敗しました: '+resp.getContentText().slice(0,200);
  return obj.id;
}

function rosterPdf_(p){
  var st=getSettings_();
  var ids=String(p.wids||'').split(',').filter(function(x){return x;});
  var ws=listWorkers_().filter(function(w){return ids.indexOf(String(w['作業員ID']))>=0;});
  if(!ws.length)throw '作業員が選択されていません';

  // mode: 'roster'=作業員名簿(本票) / 'insurance'=社会保険加入状況(別紙) / 既定=両方
  var mode=String(p.mode||'both');

  var tmplFiles=DriveApp.searchFiles('title contains "作業員名簿_テンプレート"');
  if(!tmplFiles.hasNext())throw 'Driveに「作業員名簿_テンプレート」を含むファイルが見つかりません。管理者に確認してください。';
  var tmplFile=tmplFiles.next();

  var dest=p.caseId?ensureSub_(getCaseFolder_(p.caseId),'書類'):ensureSub_(getParent_(),'安全書類');
  var label=(mode==='insurance')?'社会保険加入状況':'作業員名簿';
  var outName=label+'_'+(p.projName||st['会社名']||COMPANY_NAME)+'_'+ymd_();

  // xlsxテンプレをGoogleスプレッドシートに変換してコピー（DriveAppのみ＝Drive API有効化不要）
  var blob=tmplFile.getBlob();
  var res=Drive_create_(blob,'_tmp_roster_ss_'+Date.now(),dest);
  var ss=SpreadsheetApp.openById(res);
  var copiedFile=null;

  var PER_PAGE=11;
  var pages=Math.ceil(ws.length/PER_PAGE);

  var baseMain=ss.getSheetByName('様式書類');
  if(!baseMain)throw 'シート「様式書類」が見つかりません';
  var baseSub=ss.getSheetByName('様式書類_別紙');

  var gidList=[];

  for(var pg=0;pg<pages;pg++){
    var group=ws.slice(pg*PER_PAGE,(pg+1)*PER_PAGE);
    var mainSh, subSh;
    if(pg===0){ mainSh=baseMain; subSh=baseSub; }
    else{
      mainSh=baseMain.copyTo(ss).setName('様式書類_'+(pg+1));
      if(baseSub)subSh=baseSub.copyTo(ss).setName('様式書類_別紙_'+(pg+1));
    }
    // mode に応じて必要な方だけ流し込み＆出力対象に
    if(mode!=='insurance'){
      var pageRoles_=p.roles?String(p.roles).split(',').slice(pg*PER_PAGE,(pg+1)*PER_PAGE):[];
      rosterFillMain_(mainSh,group,st,p,pg*PER_PAGE,String(p.submitDate||''),String(p.makeDate||''),pageRoles_);
      gidList.push(mainSh.getSheetId());
    }
    if(mode!=='roster' && subSh){
      rosterFillSub_(subSh,group,st,p,pg*PER_PAGE);
      gidList.push(subSh.getSheetId());
    }
  }

  // 出力対象以外のシートを削除
  var keepIds={};
  gidList.forEach(function(g){keepIds[g]=true;});
  ss.getSheets().forEach(function(sheet){
    if(!keepIds[sheet.getSheetId()]){ try{ss.deleteSheet(sheet);}catch(e){} }
  });
  SpreadsheetApp.flush();

  // PDF出力（A3横・全シート連結）
  var url='https://docs.google.com/spreadsheets/d/'+ss.getId()+'/export?format=pdf&size=A3&portrait=false&fitw=true&gridlines=false&printtitle=false&sheetnames=false&top_margin=0.3&bottom_margin=0.3&left_margin=0.2&right_margin=0.2';
  var resp=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  var pf=dest.createFile(resp.getBlob().setName(outName+'.pdf'));
  try{pf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}

  try{DriveApp.getFileById(ss.getId()).setTrashed(true);}catch(e){}
  try{if(copiedFile)copiedFile.setTrashed(true);}catch(e){}

  var destName=p.caseId?'案件フォルダ内の「書類」':'「安全書類」フォルダ';
  return {ok:true,pdfUrl:pf.getUrl(),name:outName+'.pdf',n:ws.length,pages:pages,dest:destName};
}


function rosterXlsx_(p){
  var st=getSettings_();
  var ids=String(p.wids||'').split(',').filter(function(x){return x;});
  var ws=listWorkers_().filter(function(w){return ids.indexOf(String(w['作業員ID']))>=0;});
  if(!ws.length)throw '作業員が選択されていません';
  var mode=String(p.mode||'roster');

  var tmplFiles=DriveApp.searchFiles('title contains "作業員名簿_テンプレート"');
  if(!tmplFiles.hasNext())throw 'Driveに「作業員名簿_テンプレート」を含むファイルが見つかりません。';
  var tmplFile=tmplFiles.next();

  var dest=p.caseId?ensureSub_(getCaseFolder_(p.caseId),'書類'):ensureSub_(getParent_(),'安全書類');
  var label=(mode==='insurance')?'社会保険加入状況':'作業員名簿';
  var outName=label+'_'+(p.projName||st['会社名']||COMPANY_NAME)+'_'+ymd_();

  var blob=tmplFile.getBlob();
  var res=Drive_create_(blob,'_tmp_rx_ss_'+Date.now(),dest);
  var ss=SpreadsheetApp.openById(res);
  var copiedFile=null;

  var PER_PAGE=11, pages=Math.ceil(ws.length/PER_PAGE);
  var baseMain=ss.getSheetByName('様式書類');
  var baseSub=ss.getSheetByName('様式書類_別紙');
  var gidList=[];
  for(var pg=0;pg<pages;pg++){
    var group=ws.slice(pg*PER_PAGE,(pg+1)*PER_PAGE);
    var mainSh, subSh;
    if(pg===0){ mainSh=baseMain; subSh=baseSub; }
    else{
      mainSh=baseMain.copyTo(ss).setName('様式書類_'+(pg+1));
      if(baseSub)subSh=baseSub.copyTo(ss).setName('様式書類_別紙_'+(pg+1));
    }
    if(mode!=='insurance'){ var pageRoles2_=p.roles?String(p.roles).split(',').slice(pg*PER_PAGE,(pg+1)*PER_PAGE):[]; rosterFillMain_(mainSh,group,st,p,pg*PER_PAGE,String(p.submitDate||''),String(p.makeDate||''),pageRoles2_); gidList.push(mainSh.getSheetId()); }
    if(mode!=='roster' && subSh){ rosterFillSub_(subSh,group,st,p,pg*PER_PAGE); gidList.push(subSh.getSheetId()); }
  }
  var keepIds={}; gidList.forEach(function(g){keepIds[g]=true;});
  ss.getSheets().forEach(function(sheet){ if(!keepIds[sheet.getSheetId()]){ try{ss.deleteSheet(sheet);}catch(e){} } });
  SpreadsheetApp.flush();

  // xlsx形式でエクスポート
  var url='https://docs.google.com/spreadsheets/d/'+ss.getId()+'/export?format=xlsx';
  var resp=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  var xf=dest.createFile(resp.getBlob().setName(outName+'.xlsx'));
  try{xf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}

  try{DriveApp.getFileById(ss.getId()).setTrashed(true);}catch(e){}
  try{if(copiedFile)copiedFile.setTrashed(true);}catch(e){}

  var destName=p.caseId?'案件フォルダ内の「書類」':'「安全書類」フォルダ';
  return {ok:true,fileUrl:xf.getUrl(),name:outName+'.xlsx',n:ws.length,pages:pages,dest:destName};
}

function age_(birth){
  var b=String(birth||'').slice(0,10);if(!b)return '';
  var d=new Date(b+'T00:00:00');if(isNaN(d.getTime()))return '';
  var t=new Date(),a=t.getFullYear()-d.getFullYear();
  var m=t.getMonth()-d.getMonth();if(m<0||(m===0&&t.getDate()<d.getDate()))a--;return a;
}

// 日付値をDateに変換（テンプレの和暦書式で表示させるため）。空・無効はnull。
function toDate_(v){
  if(!v) return null;
  if(v instanceof Date) return isNaN(v.getTime())?null:v;
  var s=String(v).slice(0,10);
  var m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m) return new Date(+m[1],+m[2]-1,+m[3]);
  var d=new Date(s); return isNaN(d.getTime())?null:d;
}

// 保有資格テキストを「特別教育/技能講習/免許」の3区分に振り分ける（建設業向け）
function classifyCert_(text){
  var edu=[], skill=[], lic=[];
  String(text||'').split(/[、,，\/\n]/).forEach(function(t){
    t=t.replace(/\s+/g,'').trim(); if(!t)return;
    if(/技能講習|作業主任者/.test(t)) skill.push(t);
    else if(/特別教育|特別研修|教育/.test(t)) edu.push(t);
    else if(/電気工事士|主任技術者|技能士|施工管理技士|危険物|[一二三四五六七八九１２３４５６７８９]級|免許|免状/.test(t)) lic.push(t);
    else edu.push(t);
  });
  return {edu:edu.join('、'), skill:skill.join('、'), lic:lic.join('、')};
}

// 役割記号を凡例の略字に変換（「現場代理人/職長」→「現・長」）
function roleToAbbr_(roleStr){
  var MAP={
    '現場代理人':'現','主任技術者':'主','作業主任者':'作','職長':'長',
    '安全衛生責任者':'安','女性作業員':'女','18歳未満':'未',
    '能力向上教育':'能','危険有害業務再発防止教育':'危',
    '外国人技能実習生':'実','外国人建設就労者':'建就','1号特定技能外国人':'特'
  };
  if(!roleStr)return '';
  return roleStr.split('/').map(function(r){return MAP[r.trim()]||r.trim();}).join(' ');
}

// 本票（様式書類）流し込み
function clearFillColors_(sh){
  // シート全体の塗りつぶし色を白（無色）に、文字色を黒にする
  try{
    var rng=sh.getDataRange();
    rng.setBackground(null);       // 背景色をクリア（白に）
    rng.setFontColor('#000000');   // 文字色を黒に統一
  }catch(e){}
}

function rosterFillMain_(sh,ws,st,p,startNo,submitDate,makeDate,roles){
  startNo=startNo||0;
  clearFillColors_(sh);  // 背景を白に
  var co=st['会社名']||COMPANY_NAME;
  var addr=st['会社住所']||'';
  var chRef=p.chiefName||st['現場代理人名']||'';
  var projName=String(p.projName||'');
  var prime=String(p.prime||'');  // 元請会社名（引数で渡す）

  // ヘッダー
  // 末尾にPDF脚注が出る原因のセルメモ（S6）を削除
  try{ sh.getRange('S6').clearNote(); }catch(e){}
  sh.getRange('E5').setValue(projName||co);  // 事業所の名称＝工事名（現場名）。未選択時は会社名にフォールバック
  var WAREKI_FMT='[$-1030411]ggge"年"m"月"d"日"';
  var dSubmit=toDate_(submitDate);
  if(dSubmit){var csub=sh.getRange('AW5');csub.setValue(dSubmit);csub.setNumberFormat(WAREKI_FMT);}
  var dMake=toDate_(makeDate);
  if(dMake){var cmk=sh.getRange('S6');cmk.setValue(dMake);cmk.setNumberFormat(WAREKI_FMT);}
  // 現場IDはPDFに非表示（v77）
  sh.getRange('AH8').setValue(co);      // 自社（一次）会社名
  if(prime)sh.getRange('AW8').setValue(prime); // 元請名
  sh.getRange('E9').setValue(chRef);    // 所長名

  // 作業員枠（行19〜84＝11人分）を一括クリア
  var START_ROW=19, STEP=6, TOTAL=11;
  // クリア対象列をまとめてclearContents（A〜BD=56列）
  sh.getRange(START_ROW,1,TOTAL*STEP,56).clearContent();
  SpreadsheetApp.flush();

  // 作業員（1人目：行19、以降+6行）- バッチ書き込みで高速化
  for(var i=0;i<ws.length;i++){
    var w=ws[i];
    var r=START_ROW+i*STEP;
    var age=age_(w['生年月日']);
    var cert=classifyCert_(w['保有資格']);
    var kk=String(w['建退共手帳番号']||'');
    var koyoN=String(w['雇用保険番号']||'').replace(/[^0-9]/g,'');
    var bp=String(w['血圧']||'');
    if(bp&&bp.indexOf('/')>=0){var pp=bp.split('/');bp=pp[0]+' ～ '+pp[1];}
    var role=roleToAbbr_(roles?String(roles[i]||''):'');
    var tk=String(w['退職金共済手帳区分']||'');

    // 行+0: 番号(A)・フリガナ(B)・職種(E)・役割(G)・雇入日(I)・生年月日(M)・住所(Q)・本人TEL(X)・健診日(AB)・血液型(AF)・特殊健診(AG)・健保(AK)・建退共(AO)・特別教育(AS)・技能講習(AU)・免許(AW)
    sh.getRange(r,1).setValue(startNo+i+1);
    sh.getRange(r,2).setValue(w['ふりがな']||'');
    sh.getRange(r,5).setValue(w['職種']||'');
    if(role)sh.getRange(r,7).setValue(role).setFontSize(8);
    var dHire=toDate_(w['雇入年月日']);   if(dHire) sh.getRange(r,9).setValue(dHire);
    var dBirth=toDate_(w['生年月日']);    if(dBirth)sh.getRange(r,13).setValue(dBirth);
    sh.getRange(r,17).setValue(String(w['住所']||''));
    var tel=String(w['電話番号']||'');    if(tel)sh.getRange(r,24).setValue('（'+tel+'）');
    var dHealth=toDate_(w['最近の健康診断日']); if(dHealth)sh.getRange(r,28).setValue(dHealth);
    sh.getRange(r,32).setValue(w['血液型']||'');
    var dSp=toDate_(w['特殊健康診断日']); if(dSp)sh.getRange(r,33).setValue(dSp);
    sh.getRange(r,37).setValue(w['健康保険']||'');
    sh.getRange(r,41).setValue('');  // 建退共加入○は表示しない（v77）
    sh.getRange(r,45).setValue(cert.edu).setFontSize(7);
    sh.getRange(r,47).setValue(cert.skill).setFontSize(7);
    sh.getRange(r,49).setValue(cert.lic).setFontSize(7);
    // 退職金共済手帳（該当区分のみ表示、未入力はテンプレ文字を残す）
    if(tk==='建'){sh.getRange(r,55).setValue('建');sh.getRange(r+3,55).clearContent();}
    else if(tk==='中'){sh.getRange(r,55).setValue('中');sh.getRange(r+3,55).clearContent();}
    else if(tk==='他'){sh.getRange(r,55).clearContent();sh.getRange(r+3,55).setValue('他');}
    else if(tk==='無'){sh.getRange(r,55).clearContent();sh.getRange(r+3,55).setValue('無');}

    // 行+2: 氏名(B)・年金(AK)
    sh.getRange(r+2,2).setValue(w['氏名']||'');
    sh.getRange(r+2,37).setValue(w['厚生年金']||'');

    // 行+3: 経験年数(I)・年齢(M)・家族TEL(X)・血圧(AB)
    if(w['経験年数'])sh.getRange(r+3,9).setValue(w['経験年数']);
    if(age!==''&&age!=null)sh.getRange(r+3,13).setValue(age+' 歳');
    var emgTel=String(w['緊急連絡先電話']||'');
    if(emgTel)sh.getRange(r+3,24).setValue('（'+emgTel+'）');
    if(bp)sh.getRange(r+3,28).setValue(bp);

    // 行+4: 技能者ID(B)・雇用保険下4桁(AK)
    sh.getRange(r+4,2).setValue(w['技能者ID']||'');
    sh.getRange(r+4,37).setValue(koyoN.length>=4?koyoN.slice(-4):koyoN);

    // 3人ごとにflushしてタイムアウト防止
    if((i+1)%3===0)SpreadsheetApp.flush();
  }

  // 【問題B】使わない作業員枠（人数<11）の行を非表示にする
  if(ws.length<11){
    var hideFrom=START_ROW+ws.length*STEP;   // 最初の空き行
    var hideTo=START_ROW+11*STEP-1;           // 11人枠の最終行
    try{sh.hideRows(hideFrom,hideTo-hideFrom+1);}catch(e){}
  }
  // 【問題A】注記より下を削除＋右の余分な列を削除（本票はBD=56列まで）
  try{ var last=sh.getMaxRows(); if(last>95)sh.deleteRows(96,last-95); }catch(e){}
  try{ var lc2=sh.getMaxColumns(); if(lc2>56)sh.deleteColumns(57,lc2-56); }catch(e){}
}

// 別紙（様式書類_別紙）流し込み
function rosterFillSub_(sh,ws,st,p,startNo){
  startNo=startNo||0;
  clearFillColors_(sh);  // 背景を白に
  var co=st['会社名']||COMPANY_NAME;
  var chRef=p.chiefName||st['現場代理人名']||'';
  var prime=String(p.prime||'');
  var addr=st['会社住所']||'';
  var projName=String(p.projName||'');

  // ヘッダー
  sh.getRange('D11').setValue(projName||co);  // 事業所の名称＝工事名（現場名）。未選択時は会社名
  sh.getRange('D13').setValue(chRef);                  // 所長名
  sh.getRange('M13').setValue(co);                     // 自社名
  if(prime)sh.getRange('V13').setValue(prime);         // 元請名

  // 作業員枠（行21〜、11人分）を一旦クリア（複製時の残存データ対策）
  var START_ROW=21, STEP=3;
  for(var ci=0;ci<11;ci++){
    var cr=START_ROW+ci*STEP;
    sh.getRange(cr,1).clearContent();    // 番号
    sh.getRange(cr,2).clearContent();    // フリガナ
    sh.getRange(cr,9).clearContent();    // 健保
    sh.getRange(cr,15).clearContent();   // 年金
    sh.getRange(cr+1,2).clearContent();  // 氏名
  }

  // 作業員（1人目：行21、以降+3行）
  for(var i=0;i<ws.length;i++){
    var w=ws[i];
    var r=START_ROW+i*STEP;
    // 行+0
    sh.getRange(r,1).setValue(startNo+i+1);          // A: 番号（通し番号）
    sh.getRange(r,2).setValue(w['ふりがな']||'');     // B: フリガナ
    sh.getRange(r,9).setValue(w['健康保険']||'');     // I: 健保名
    sh.getRange(r,15).setValue(w['厚生年金']||'');    // O: 年金種別
    // 行+1
    sh.getRange(r+1,2).setValue(w['氏名']||'');       // B: 氏名
    // 健保番号・年金番号はGASの作業員マスタには現状無いため空欄（将来拡張用）
  }

  // 【問題B】使わない枠の行を非表示
  if(ws.length<11){
    var hideFrom=START_ROW+ws.length*STEP;
    var hideTo=START_ROW+11*STEP-1;
    try{sh.hideRows(hideFrom,hideTo-hideFrom+1);}catch(e){}
  }
  // 【問題A】注記より下を削除＋右の余分な列を削除（別紙はZ=26列まで）
  try{ var lr=sh.getMaxRows(); if(lr>62)sh.deleteRows(63,lr-62); }catch(e){}
  try{ var lc=sh.getMaxColumns(); if(lc>26)sh.deleteColumns(27,lc-26); }catch(e){}
}


function listTools_(){ var all=readAll_(SHEET_TOOLS,TOOL_HEADERS,'道具ID');
  all.sort(function(a,b){var x=Number(a['表示順'])||999,y=Number(b['表示順'])||999;return x-y||String(a['道具名']||'').localeCompare(String(b['道具名']||''),'ja');});
  return all; }
function addTool_(data){ var sh=sheet_(SHEET_TOOLS);ensureColumns_(sh,TOOL_HEADERS);var now=new Date(),id=data['道具ID']||uid_('T');
  var rec=merge_(blank_(TOOL_HEADERS),data);rec['道具ID']=id;if(!rec['状態'])rec['状態']='通常';rec['登録日時']=now;rec['更新日時']=now;
  sh.appendRow(TOOL_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function updateTool_(id,data){ var sh=sheet_(SHEET_TOOLS);ensureColumns_(sh,TOOL_HEADERS);var r=findRow_(sh,'道具ID',id);if(r<0)throw'道具IDが見つかりません: '+id;
  var rec=merge_(rowToObj_(sh,r,TOOL_HEADERS),data);rec['道具ID']=id;rec['更新日時']=new Date();
  sh.getRange(r,1,1,TOOL_HEADERS.length).setValues([TOOL_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }
function deleteTool_(id,secret){ return softDeleteById_(SHEET_TOOLS,'道具ID',id,secret); }
// 貸出（誰でも可：現場から持出記録できるように）
function listToolLends_(){ return readAll_(SHEET_TOOLLEND,TOOLLEND_HEADERS,'貸出ID'); }
function toolLend_(data){ var sh=sheet_(SHEET_TOOLLEND);ensureColumns_(sh,TOOLLEND_HEADERS);var now=new Date(),id=uid_('L');
  var rec=merge_(blank_(TOOLLEND_HEADERS),data);rec['貸出ID']=id;
  if(!rec['貸出日'])rec['貸出日']=ymd_(); if(!rec['数量'])rec['数量']=1;
  rec['返却日']=''; rec['状態']='貸出中'; rec['登録日時']=now; rec['更新日時']=now;
  sh.appendRow(TOOLLEND_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';}));return readObj_(rec); }
function toolReturn_(id,date){ var sh=sheet_(SHEET_TOOLLEND);var r=findRow_(sh,'貸出ID',id);if(r<0)throw'貸出記録が見つかりません';
  var rec=rowToObj_(sh,r,TOOLLEND_HEADERS);rec['返却日']=date||ymd_();rec['状態']='返却済';rec['更新日時']=new Date();
  sh.getRange(r,1,1,TOOLLEND_HEADERS.length).setValues([TOOLLEND_HEADERS.map(function(h){return rec[h]!==undefined?rec[h]:'';})]);return readObj_(rec); }


// ===== 日報未提出サマリー（v47）=====
// 指定期間内の各日について、スケジュールで担当に入っているのに日報未提出の社員を集計
function reportGaps_(from,to){
  var tz=Session.getScriptTimeZone();
  function d10(v){ if(!v)return ''; if(v instanceof Date)return Utilities.formatDate(v,tz,'yyyy-MM-dd'); return String(v).slice(0,10).replace(/\//g,'-'); }
  var today=Utilities.formatDate(new Date(),tz,'yyyy-MM-dd');
  from=d10(from)||today; to=d10(to)||today;
  // 社員（協力業者除く）
  var emps=listWorkers_().filter(function(w){return String(w['区分']||'').indexOf('協力')<0;});
  function norm(s){ return String(s||'').replace(/[\s　]/g,''); }
  // 名前→作業員ID 逆引き（氏名・略称）
  var nameMap={};
  emps.forEach(function(w){ if(w['氏名'])nameMap[norm(w['氏名'])]=w; if(w['略称'])nameMap[norm(w['略称'])]=w; });
  // 日報：日付ごと作業員ごと提出フラグ
  var repSet={};
  listReports_().forEach(function(r){ var dt=d10(r['日付']); if(dt)repSet[dt+'|'+String(r['作業員ID'])]=1; });
  // スケジュール：日付ごとに担当社員を展開
  var schByDate={};
  listSchedules_().forEach(function(sc){
    var a=d10(sc['日付']); if(!a)return; var b=d10(sc['終了日'])||a;
    var who=String(sc['担当']||''); if(!who)return;
    var parts=who.split(/[・,、\/／\s　]+/).filter(function(x){return x;});
    // 日付範囲を展開（最大62日に制限）
    var sd=new Date(a+'T00:00:00'), ed=new Date(b+'T00:00:00'), cnt=0;
    while(sd<=ed && cnt<62){
      var ds=Utilities.formatDate(sd,tz,'yyyy-MM-dd');
      if(ds>=from && ds<=to){
        parts.forEach(function(nm){ var w=nameMap[norm(nm)]; if(w){
          (schByDate[ds]=schByDate[ds]||{})[String(w['作業員ID'])]=w; } });
      }
      sd.setDate(sd.getDate()+1); cnt++;
    }
  });
  // 日付を列挙して未提出を集計
  var days=[], sd2=new Date(from+'T00:00:00'), ed2=new Date(to+'T00:00:00'), guard=0;
  while(sd2<=ed2 && guard<120){
    var ds=Utilities.formatDate(sd2,tz,'yyyy-MM-dd');
    var assigned=schByDate[ds]||{};
    var miss=[];
    Object.keys(assigned).forEach(function(wid){
      if(!repSet[ds+'|'+wid]){ var w=assigned[wid]; miss.push({'作業員ID':wid,'氏名':w['氏名']||'','略称':w['略称']||''}); }
    });
    if(Object.keys(assigned).length>0){
      days.push({date:ds, assigned:Object.keys(assigned).length, missing:miss});
    }
    sd2.setDate(sd2.getDate()+1); guard++;
  }
  return {from:from,to:to,days:days};
}


// ===== 顧客向け進捗共有（v50）=====
// 共有トークンを発行（既にあれば再利用）。案件マスタの「共有トークン」列に保存。
function shareEnable_(caseId){
  var sh=sheet_(SHEET_PROJECTS); ensureColumns_(sh,PROJECT_HEADERS);
  var r=findRow_(sh,'案件ID',caseId); if(r<0)throw'案件が見つかりません';
  var obj=rowToObj_(sh,r,PROJECT_HEADERS);
  var tok=String(obj['共有トークン']||'').trim();
  if(!tok){ tok='shr_'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
    setProjectField_(sh,r,'共有トークン',tok); }
  return {ok:true,token:tok};
}
function shareDisable_(caseId){
  var sh=sheet_(SHEET_PROJECTS); ensureColumns_(sh,PROJECT_HEADERS);
  var r=findRow_(sh,'案件ID',caseId); if(r<0)return false;
  setProjectField_(sh,r,'共有トークン','');
  return true;
}
function shareStatus_(caseId){
  var sh=sheet_(SHEET_PROJECTS),r=findRow_(sh,'案件ID',caseId); if(r<0)return {ok:true,token:''};
  var obj=rowToObj_(sh,r,PROJECT_HEADERS);
  return {ok:true,token:String(obj['共有トークン']||'').trim()};
}
// 公開ビュー：トークンに一致する案件の「公開して差し支えない情報だけ」を返す。
// ★金額・原価・顧客連絡先・担当者個人情報などは一切返さない。
function shareView_(token){
  token=String(token||'').trim();
  if(!token) return {ok:false,error:'リンクが正しくありません'};
  var sh=sheet_(SHEET_PROJECTS),last=sh.getLastRow();
  if(last<2) return {ok:false,error:'公開対象が見つかりません'};
  var hs=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var tc=hs.indexOf('共有トークン')+1;
  if(tc<1) return {ok:false,error:'公開対象が見つかりません'};
  var col=sh.getRange(2,tc,last-1,1).getValues();
  var row=-1;
  for(var i=0;i<col.length;i++){ if(String(col[i][0]).trim()===token){ row=i+2; break; } }
  if(row<0) return {ok:false,error:'このリンクは無効か、公開が停止されています'};
  var p=rowToObj_(sh,row,PROJECT_HEADERS);
  var tz=Session.getScriptTimeZone();
  function d10(v){ if(!v)return ''; if(v instanceof Date)return Utilities.formatDate(v,tz,'yyyy-MM-dd'); return String(v).slice(0,10).replace(/\//g,'-'); }
  // 予定（工程）：この案件の予定を時系列で（内容と日付・時間帯のみ。担当者名などは伏せる）
  var sched=listSchedules_().filter(function(x){return String(x['案件ID'])===String(p['案件ID']);})
    .map(function(x){ return {date:d10(x['日付']), end:d10(x['終了日']), title:String(x['予定内容']||x['区分']||'作業'),
      kubun:String(x['区分']||''), st:String(x['開始']||'').slice(0,5), et:String(x['終了']||'').slice(0,5) }; })
    .sort(function(a,b){return String(a.date).localeCompare(String(b.date));});
  // 写真：写真フォルダの最新N枚をサムネで（リンク共有化）
  var photos=[];
  try{
    var pf=getPhotoFolder_(p['案件ID']); collectPhotos_(pf, photos);
    photos.sort(function(a,b){return a.name<b.name?1:-1;});   // 新しい名前順
    photos=photos.slice(0,40).map(function(x){ return {thumb:'https://drive.google.com/thumbnail?id='+x.id+'&sz=w1000'}; });
  }catch(e){ photos=[]; }
  return {ok:true, project:{
    name:String(p['案件名']||''), place:String(p['場所']||''),
    status:String(p['ステータス']||''), kind:String(p['種別']||''),
    start:d10(p['工期開始']), end:d10(p['工期完了'])
  }, schedules:sched, photos:photos, company:String(getSettings_()['会社名']||COMPANY_NAME)};
}


// ===== 完了案件の保管と削除（アーカイブ）（v52）=====
// ①archiveExport_：案件の全データ（案件情報・スケジュール・日報・原価・メモ・見積請求・道具貸出）を
//   1つのExcelにまとめて案件のDriveフォルダへ保存（NAS保管用）
function offlineExport_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = Session.getScriptTimeZone();
  var stamp = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm');
  var st = getSettings_();
  var companyName = st['会社名'] || COMPANY_NAME;

  // 書き出すシートとその表示名・表示順の定義
  var TARGETS = [
    {sheet: SHEET_PROJECTS,  label: '案件マスタ',      key: '案件ID'},
    {sheet: SHEET_CUSTOMERS, label: '取引先マスタ',    key: '顧客ID'},
    {sheet: SHEET_WORKERS,   label: '作業員マスタ',    key: '作業員ID',  maskCol: 'パスワード'},
    {sheet: SHEET_REPORTS,   label: '作業日報',        key: '日報ID'},
    {sheet: SHEET_KINTAI,    label: '勤怠',            key: '勤怠ID'},
    {sheet: SHEET_SCHEDULE,  label: 'スケジュール',    key: '予定ID'},
    {sheet: SHEET_COSTS,     label: '原価',            key: '原価ID'},
    {sheet: SHEET_EST,       label: '見積・請求',      key: '伝票ID'},
    {sheet: SHEET_CONTACTS,  label: '先方担当者',      key: '担当者ID'},
    {sheet: SHEET_VEHICLES,  label: '車両マスタ',      key: '車両ID'},
    {sheet: SHEET_SUPPLIERS, label: '仕入先',          key: '仕入先ID'},
    {sheet: SHEET_TOOLS,     label: '道具マスタ',      key: '道具ID'},
    {sheet: SHEET_TOOLLEND,  label: '道具貸出',        key: '貸出ID'},
    {sheet: SHEET_DAIKO,     label: '下請業者',        key: '下請ID'},
    {sheet: SHEET_NOTES,     label: '現場メモ',        key: 'メモID'},
    {sheet: SHEET_APPLICATIONS, label: '申請',         key: '申請ID'},
    {sheet: SHEET_LEAVE,     label: '有給',            key: '記録ID'},
    {sheet: SHEET_DOCS,      label: '書類管理',        key: '書類ID'},
  ];

  var sheets = [];
  TARGETS.forEach(function(t){
    var sh = ss.getSheetByName(t.sheet);
    if(!sh || sh.getLastRow() < 2){ sheets.push({label:t.label, headers:[], rows:[], truncated:false}); return; }
    var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
    var vals = sh.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = vals[0].map(function(v){ return String(v==null?'':v); });
    // パスワード列をマスク
    var maskIdx = t.maskCol ? headers.indexOf(t.maskCol) : -1;
    var dataRows = vals.slice(1).filter(function(r){ return String(r[0]||'') !== ''; });
    var truncated = dataRows.length > OFFLINE_ROW_LIMIT;
    if(truncated) dataRows = dataRows.slice(0, OFFLINE_ROW_LIMIT);
    var rows = dataRows.map(function(r){
      return headers.map(function(h, i){
        if(maskIdx >= 0 && i === maskIdx) return '****';
        var v = r[i];
        if(v instanceof Date){
          var t2 = v.getHours()||v.getMinutes()||v.getSeconds();
          return Utilities.formatDate(v, tz, t2 ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd');
        }
        return String(v == null ? '' : v);
      });
    });
    sheets.push({label:t.label, headers:headers, rows:rows, truncated:truncated, count:rows.length});
  });

  var html = buildOfflineHtml_(companyName, stamp, sheets);
  var b64 = Utilities.base64Encode(Utilities.newBlob(html, 'text/html; charset=utf-8').getBytes());
  return {ok:true, htmlBase64: b64, stamp: stamp, company: companyName};
}

// HTMLビュワー本体を文字列として生成
function buildOfflineHtml_(company, stamp, sheets){
  var dataJson = JSON.stringify(sheets);
  return '<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>'+escHtml_(company)+' データビュワー（オフライン版）</title>\n'+offlineViewerCss_()+'\n</head>\n<body>\n<div class="wrap">\n<div class="head">\n  <div class="titlerow"><span class="title">'+escHtml_(company)+'　データビュワー</span><span class="badge">オフライン版</span></div>\n  <div class="stamp">保存時点：<b>'+escHtml_(stamp)+'</b></div>\n  <div class="note">このファイル1枚に全データが入っています。インターネット・Google・GitHubがなくても、ダブルクリックするだけでどのパソコンでも開けます。</div>\n</div>\n<div class="tabs" id="tabs"></div>\n<div class="toolbar">\n  <div class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input id="q" type="text" placeholder="このタブの中を検索…" aria-label="検索"></div>\n  <span class="count" id="count"></span>\n  <button class="btn-xl" id="xl" type="button"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>Excelで保存（CSV）</button>\n</div>\n<div class="tablebox"><div class="scroll"><table id="tbl"><thead></thead><tbody></tbody></table></div></div>\n<div class="trnote" id="trnote" style="display:none;"></div>\n<p class="footer">データは保存時点のスナップショットです。作業員のパスワードは伏せて出力しています。<br>写真はこのファイルに含まれません（Google Driveに保存されています）。</p>\n</div>\n<div class="toast" id="toast"></div>\n<script>\nvar SHEETS='+dataJson+';\nvar active=0;\nvar tabsEl=document.getElementById(\'tabs\');\nvar theadEl=document.querySelector(\'#tbl thead\');\nvar tbodyEl=document.querySelector(\'#tbl tbody\');\nvar qEl=document.getElementById(\'q\');\nvar countEl=document.getElementById(\'count\');\nvar trnoteEl=document.getElementById(\'trnote\');\nSHEETS.forEach(function(s,i){\n  var b=document.createElement(\'button\');\n  b.className=\'tab\'+(i===0?\' on\':\'\');\n  b.textContent=s.label+(s.count?\' (\'+s.count+\')\':\'\')+\'\';\n  b.setAttribute(\'role\',\'tab\');\n  b.onclick=(function(idx){return function(){\n    active=idx;qEl.value=\'\';\n    document.querySelectorAll(\'.tab\').forEach(function(t,j){t.className=\'tab\'+(j===idx?\' on\':\'\');});\n    render();\n  };})(i);\n  tabsEl.appendChild(b);\n});\nfunction esc(s){return String(s==null?\'\':s).replace(/[&<>"]/g,function(c){return{\'&\':\'&amp;\',\'<\':\'&lt;\'  ,\'>\':\'&gt;\',\'"\':\'&quot;\'}[c];});}\nfunction visibleRows(){\n  var s=SHEETS[active];var q=qEl.value.trim();\n  if(!q)return s.rows;\n  return s.rows.filter(function(r){return r.some(function(c){return c.indexOf(q)>=0;});});\n}\nfunction render(){\n  var s=SHEETS[active];var rows=visibleRows();\n  theadEl.innerHTML=\'<tr>\'+s.headers.map(function(h){return\'<th>\'+esc(h)+\'</th>\';}).join(\'\')+\'</tr>\';\n  if(!s.headers.length){tbodyEl.innerHTML=\'<tr><td colspan="1"><div class="empty">データなし</div></td></tr>\';countEl.textContent=\'0件\';trnoteEl.style.display=\'none\';return;}\n  if(!rows.length){tbodyEl.innerHTML=\'<tr><td colspan="\'+s.headers.length+\'"><div class="empty">該当なし</div></td></tr>\';}\n  else{tbodyEl.innerHTML=rows.map(function(r){return\'<tr>\'+r.map(function(c){return\'<td>\'+esc(c)+\'</td>\';}).join(\'\')+\'</tr>\';}).join(\'\');}\n  countEl.textContent=rows.length+\'件\';\n  if(s.truncated){trnoteEl.style.display=\'block\';trnoteEl.textContent=\'※ 件数が多いため先頭3,000行のみ表示しています。全件はスプレッドシートを直接ご覧ください。\';}else{trnoteEl.style.display=\'none\';}\n}\nqEl.addEventListener(\'input\',render);\nfunction csvCell(v){v=String(v==null?\'\':v);return /[",\\r\\n]/.test(v)?\'"\'+v.replace(/"/g,\'""\')+\'"\':v;}\ndocument.getElementById(\'xl\').onclick=function(){\n  var s=SHEETS[active];var rows=[s.headers].concat(visibleRows());\n  var csv=\'\\uFEFF\'+rows.map(function(r){return r.map(csvCell).join(\',\');}).join(\'\\r\\n\');\n  var blob=new Blob([csv],{type:\'text/csv;charset=utf-8;\'});\n  var url=URL.createObjectURL(blob);\n  var a=document.createElement(\'a\');a.href=url;a.download=\'現場管理_\'+s.label+\'.csv\';\n  document.body.appendChild(a);a.click();a.remove();\n  setTimeout(function(){URL.revokeObjectURL(url);},1000);\n  showToast(\'「\'+s.label+\'」をExcel用（CSV）で書き出しました\');\n};\nvar toastT;\nfunction showToast(m){var t=document.getElementById(\'toast\');t.textContent=m;t.className=\'toast show\';clearTimeout(toastT);toastT=setTimeout(function(){t.className=\'toast\';},2800);}\nrender();\n</script>\n</body>\n</html>';
}

function offlineViewerCss_(){
  return '<style>\n:root{--bg:#f6f7f9;--surface:#fff;--ink:#0f172a;--muted:#64748b;--line:#e4e8ee;--line2:#eef1f5;--accent:#475569;--accent-b:#334155;--mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;--jp:-apple-system,"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;}\n*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--jp);-webkit-font-smoothing:antialiased;line-height:1.6;padding:14px}\n.wrap{max-width:960px;margin:0 auto}\n.head{background:var(--surface);border:1px solid var(--line);border-radius:12px 12px 0 0;border-bottom:none;padding:16px 16px 12px}\n.titlerow{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}\n.title{font-size:17px;font-weight:700}\n.badge{font-family:var(--mono);font-size:11px;color:var(--accent);border:1px solid #c8d0dc;background:#f0f2f5;border-radius:999px;padding:2px 8px}\n.stamp{margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--muted)}\n.stamp b{color:var(--ink)}\n.note{margin-top:5px;font-size:12.5px;color:var(--muted)}\n.tabs{display:flex;gap:2px;background:var(--surface);border-left:1px solid var(--line);border-right:1px solid var(--line);padding:0 8px;overflow-x:auto;flex-wrap:wrap;}\n.tab{appearance:none;border:none;background:none;cursor:pointer;font-family:var(--jp);font-size:13px;color:var(--muted);padding:9px 11px 10px;border-bottom:2px solid transparent;white-space:nowrap;font-weight:600}\n.tab:hover{color:var(--ink)}\n.tab.on{color:var(--accent-b);border-bottom-color:var(--accent)}\n.toolbar{display:flex;gap:9px;align-items:center;background:var(--surface);border-left:1px solid var(--line);border-right:1px solid var(--line);border-top:1px solid var(--line2);padding:10px 12px;flex-wrap:wrap}\n.search{flex:1;min-width:160px;position:relative}\n.search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted)}\n.search input{width:100%;font-family:var(--jp);font-size:13.5px;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:8px 11px 8px 30px;background:#fbfcfd;}\n.search input:focus{outline:none;border-color:var(--accent)}\n.count{font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap}\n.btn-xl{appearance:none;cursor:pointer;font-family:var(--jp);font-size:13.5px;font-weight:600;color:#fff;background:var(--accent);border:1px solid var(--accent);border-radius:9px;padding:8px 13px;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}\n.btn-xl:hover{background:var(--accent-b)}\n.tablebox{background:var(--surface);border:1px solid var(--line);border-top:1px solid var(--line2);border-radius:0 0 12px 12px;overflow:hidden}\n.scroll{overflow-x:auto}\ntable{border-collapse:collapse;width:100%;font-size:13px}\nth,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line2);white-space:nowrap;vertical-align:top}\nth{background:#fafbfc;color:var(--muted);font-weight:600;font-size:12px;position:sticky;top:0;letter-spacing:.02em}\ntbody tr:hover{background:#f8fafb}\n.empty{padding:30px 16px;text-align:center;color:var(--muted);font-size:13.5px}\n.trnote{font-size:12px;color:#92400e;background:#fff7ed;border:1px solid #f0c674;border-radius:0 0 10px 10px;padding:8px 14px;margin-top:-1px}\n.footer{font-size:12px;color:var(--muted);margin:12px 2px 4px;line-height:1.7}\n.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(16px);background:var(--ink);color:#fff;font-size:13px;padding:10px 16px;border-radius:10px;box-shadow:0 6px 20px rgba(15,23,42,.22);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}\n.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\n</style>';
}

function escHtml_(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

// スプレッドシートのメニューから実行した場合
function menuOfflineExport(){
  try{
    var r = offlineExport_();
    var bytes = Utilities.base64Decode(r.htmlBase64);
    var blob = Utilities.newBlob(bytes, 'text/html', 'データビュワー_'+r.company+'_'+r.stamp.replace(/[ :]/g,'-')+'.html');
    var folder = backupFolder_();
    var f = folder.createFile(blob);
    SpreadsheetApp.getUi().alert(
      'オフラインビュワーを書き出しました。\n\n'+
      '保存先フォルダ（現場管理DB_バックアップ）：\n'+folder.getUrl()+'\n\n'+
      'ファイルURL：\n'+f.getUrl()+'\n\n'+
      '★このHTMLファイルをパソコンにダウンロードして保管してください。\n'+
      '　ネット・Google・GitHubなしで開けます。'
    );
  }catch(e){
    try{SpreadsheetApp.getUi().alert('書き出しに失敗しました：\n'+e);}catch(e2){}
  }
}

function archiveExport_(caseId){
  var sh=sheet_(SHEET_PROJECTS),r=findRow_(sh,'案件ID',caseId); if(r<0)throw'案件が見つかりません';
  var p=rowToObj_(sh,r,PROJECT_HEADERS);
  var tz=Session.getScriptTimeZone();
  var ssNew=SpreadsheetApp.create('tmp_archive_'+Date.now());
  var first=ssNew.getSheets()[0]; first.setName('案件情報');
  var rows=PROJECT_HEADERS.map(function(h){ var v=p[h];
    if(v instanceof Date)v=Utilities.formatDate(v,tz,'yyyy-MM-dd HH:mm');
    return [h,String(v==null?'':v)]; });
  first.getRange(1,1,rows.length,2).setValues(rows);
  first.getRange(1,1,rows.length,1).setFontWeight('bold').setBackground('#eef1f5');
  first.setColumnWidth(1,150); first.setColumnWidth(2,440);
  var counts={};
  function addTab(name,sheetName,keyCol){
    var src=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    var out=ssNew.insertSheet(name); counts[name]=0;
    if(!src||src.getLastRow()<2){ out.getRange(1,1).setValue('（データなし）'); return; }
    var vals=src.getRange(1,1,src.getLastRow(),src.getLastColumn()).getValues();
    var hs=vals[0].map(String), ki=hs.indexOf(keyCol);
    out.getRange(1,1,1,hs.length).setValues([hs]).setFontWeight('bold').setBackground('#eef1f5');
    if(ki<0)return;
    var data=[]; for(var i=1;i<vals.length;i++){ if(String(vals[i][ki])===String(caseId))data.push(vals[i]); }
    if(data.length)out.getRange(2,1,data.length,hs.length).setValues(data);
    counts[name]=data.length;
  }
  addTab('スケジュール',SHEET_SCHEDULE,'案件ID');
  addTab('作業日報',SHEET_REPORTS,'案件ID');
  addTab('原価',SHEET_COSTS,'案件ID');
  addTab('現場メモ',SHEET_NOTES,'案件ID');
  addTab('見積請求',SHEET_EST,'案件ID');
  addTab('道具貸出',SHEET_TOOLLEND,'現場ID');
  SpreadsheetApp.flush();
  var url='https://docs.google.com/spreadsheets/d/'+ssNew.getId()+'/export?format=xlsx';
  var resp=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  var folder=getCaseFolder_(caseId);
  var safe=String(p['案件名']||caseId).replace(/[\/\\:*?"<>|]/g,'');
  var name='保管用データ_'+safe+'_'+ymd_()+'.xlsx';
  var pf=folder.createFile(resp.getBlob().setName(name));
  try{DriveApp.getFileById(ssNew.getId()).setTrashed(true);}catch(e){}
  return {ok:true,fileUrl:pf.getUrl(),folderUrl:folder.getUrl(),name:name,counts:counts};
}
// ②archivePurge_：各シートからこの案件の行を削除（trash='1'でDriveフォルダもゴミ箱へ）
function purgeRows_(sheetName,keyCol,caseId){
  var src=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if(!src||src.getLastRow()<2)return 0;
  var lastC=src.getLastColumn();
  var hs=src.getRange(1,1,1,lastC).getValues()[0].map(String), ki=hs.indexOf(keyCol);
  if(ki<0)return 0;
  var col=src.getRange(2,ki+1,src.getLastRow()-1,1).getValues(), n=0;
  for(var i=col.length-1;i>=0;i--){ if(String(col[i][0])===String(caseId)){ src.deleteRow(i+2); n++; } }
  return n;
}
function archivePurge_(caseId,trash){
  // Driveフォルダの処理は案件行を消す前に（フォルダ特定に案件情報が必要なため）
  var folderTrashed=false;
  if(String(trash)==='1'){
    try{ var f=getCaseFolder_(caseId); f.setTrashed(true); folderTrashed=true; }catch(e){}
  }
  var counts={};
  counts['スケジュール']=purgeRows_(SHEET_SCHEDULE,'案件ID',caseId);
  counts['作業日報']=purgeRows_(SHEET_REPORTS,'案件ID',caseId);
  counts['原価']=purgeRows_(SHEET_COSTS,'案件ID',caseId);
  counts['現場メモ']=purgeRows_(SHEET_NOTES,'案件ID',caseId);
  counts['見積請求']=purgeRows_(SHEET_EST,'案件ID',caseId);
  counts['道具貸出']=purgeRows_(SHEET_TOOLLEND,'現場ID',caseId);
  var sh=sheet_(SHEET_PROJECTS),r=findRow_(sh,'案件ID',caseId);
  if(r>0){ sh.deleteRow(r); counts['案件']=1; } else counts['案件']=0;
  return {ok:true,counts:counts,folderTrashed:folderTrashed};
}

// ===== 施工体制台帳・再下請負通知書（v56）=====
function daikoData_(p){
  var caseId=String(p.caseId||'');
  var all=readAll_(SHEET_DAIKO,DAIKO_HEADERS,'下請ID');
  var subs=caseId?all.filter(function(x){return String(x['案件ID'])===caseId;}):all;
  var proj=caseId?listProjects_().filter(function(x){return String(x['案件ID'])===caseId;})[0]:null;
  var st=getSettings_();
  return {ok:true,subs:subs,project:proj||null,settings:st,projects:listProjects_()};
}
function daikoSave_(p){
  var data=p.data||{};
  var sh=sheet_(SHEET_DAIKO); ensureColumns_(sh,DAIKO_HEADERS);
  var now=new Date();
  if(data['下請ID']){
    var all=readAll_(SHEET_DAIKO,DAIKO_HEADERS,'下請ID');
    for(var i=0;i<all.length;i++){
      if(String(all[i]['下請ID'])===String(data['下請ID'])){
        var row=merge_(blank_(DAIKO_HEADERS),data); row['更新日時']=now;
        var vals=DAIKO_HEADERS.map(function(k){return row[k]!=null?row[k]:'';});
        sh.getRange(i+2,1,1,vals.length).setValues([vals]); return {ok:true,sub:row};
      }
    }
  }
  var id=uid_('DK'); var rec=merge_(blank_(DAIKO_HEADERS),data);
  rec['下請ID']=id; rec['登録日時']=now; rec['更新日時']=now;
  sh.appendRow(DAIKO_HEADERS.map(function(k){return rec[k]!=null?rec[k]:''; }));
  return {ok:true,sub:rec};
}
function daikoDelete_(p){
  var id=String(p.id||'');
  var sh=sheet_(SHEET_DAIKO); var vals=sh.getDataRange().getValues();
  var col=DAIKO_HEADERS.indexOf('下請ID');
  for(var i=vals.length-1;i>=1;i--){ if(String(vals[i][col])===id){ sh.deleteRow(i+1); return {ok:true}; } }
  return {ok:false,error:'not found'};
}

// ---- 施工体制台帳 PDF（全建統一参考様式第1号） ----
// ===== 安全書類：施工体制台帳・再下請負通知書・下請負業者編成表（v58）=====

// 施工体制台帳PDF生成
function taiseiPdf_(p){
  return safetyFormPdf_(p,'施工体制台帳_テンプレート','施工体制台帳');
}

// 再下請負通知書PDF生成
function saitekePdf_(p){
  return safetyFormPdf_(p,'再下請負通知書_テンプレート','再下請負通知書');
}

// 下請負業者編成表PDF生成（新規）
function henseiPdf_(p){
  return safetyFormPdf_(p,'下請負業者編成表_テンプレート','下請負業者編成表');
}

// 共通：テンプレコピー→流し込み→PDF出力
function safetyFormPdf_(p,tmplName,formName){
  var st=getSettings_();
  var tmplFiles=DriveApp.searchFiles('title contains "'+tmplName+'"');
  if(!tmplFiles.hasNext())throw 'Driveに「'+tmplName+'」を含むファイルが見つかりません。';
  var tmplFile=tmplFiles.next();

  var dest=p.caseId?ensureSub_(getCaseFolder_(p.caseId),'書類'):ensureSub_(getParent_(),'安全書類');
  var outName=formName+'_'+(p.projName||st['会社名']||COMPANY_NAME)+'_'+ymd_();

  // xlsxテンプレをGoogleスプレッドシートに変換（DriveAppのみ＝Drive API有効化不要）
  var blob=tmplFile.getBlob();
  var res=Drive_create_(blob,'_tmp_'+formName+'_ss_'+Date.now(),dest);
  var ss=SpreadsheetApp.openById(res);
  var copiedFile=null;

  var sh=ss.getSheetByName('様式書類');
  if(!sh)throw 'シート「様式書類」が見つかりません';

  // 下請データをDBから取得（フロントが渡していなくてもGAS側で補完）
  if(!p.subs && p.caseId){
    try{ var dk=daikoData_({caseId:String(p.caseId)}); p.subs=dk.subs||[]; }catch(e){ p.subs=[]; }
  }

  clearFillColors_(sh);  // 背景を白に

  // 様式ごとの流し込み
  if(formName==='施工体制台帳') taseiFill_(sh,p,st);
  else if(formName==='再下請負通知書') saitakeFill_(sh,p,st);
  else if(formName==='下請負業者編成表') henseiFill_(sh,p,st);

  // 再下請負通知書は別紙もあり
  var sh2=null;
  if(formName==='再下請負通知書'){
    sh2=ss.getSheetByName('様式書類_別紙');
  }

  SpreadsheetApp.flush();

  var sh1id=sh.getSheetId();
  var gids='&gid='+sh1id;
  if(sh2)gids+='&gid='+sh2.getSheetId();
  var url='https://docs.google.com/spreadsheets/d/'+ss.getId()+
    '/export?format=pdf&size=A4&portrait=true&fitw=true&gridlines=false'+
    '&printtitle=false&sheetnames=false'+
    '&top_margin=0.3&bottom_margin=0.3&left_margin=0.2&right_margin=0.2'+gids;
  var resp=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  var pf=dest.createFile(resp.getBlob().setName(outName+'.pdf'));
  try{pf.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  try{DriveApp.getFileById(ss.getId()).setTrashed(true);}catch(e){}
  try{if(copiedFile)copiedFile.setTrashed(true);}catch(e){}
  return {ok:true,pdfUrl:pf.getUrl(),name:outName+'.pdf'};
}

// 施工体制台帳 流し込み
function taseiFill_(sh,p,st){
  var now=new Date();
  var co=st['会社名']||COMPANY_NAME;
  var addr=st['会社住所']||'';
  var tel=st['会社電話']||'';
  var rep=st['代表者名']||'';
  var permit=st['建設業許可番号']||'';
  var gyoshu=st['許可業種']||'';
  var dairi=st['現場代理人名']||'';
  var kanri=st['監理技術者名']||'';
  var projName=String(p.projName||'');
  var prime=String(p.prime||'');  // 発注者名
  var primeAddr=String(p.primeAddr||'');
  var caseId=String(p.caseId||'');

  // 作成日
  sh.getRange('U2').setValue(wareki_(now).y);
  sh.getRange('Y2').setValue(now.getMonth()+1);
  sh.getRange('AA2').setValue(now.getDate());

  // 自社情報（元請として）
  sh.getRange('AJ3').setValue(co+(permit?'・'+permit:''));  // 会社名・事業者ID
  sh.getRange('AX3').setValue(rep);                          // 代表者名
  sh.getRange('G6').setValue(co+(permit?'・'+permit:''));    // 会社名・事業者ID（元請欄）
  if(addr){var zip=addr.match(/〒?([\d-]+)/);sh.getRange('AJ6').setValue(zip?zip[1]:'');}
  sh.getRange('AJ7').setValue(addr);                         // 住所
  sh.getRange('AW8').setValue(tel);                          // 電話番号
  sh.getRange('F12').setValue(gyoshu);                       // 工事業種

  // 工事名・発注者
  sh.getRange('G17').setValue(projName);
  sh.getRange('G20').setValue(prime+(primeAddr?'\n'+primeAddr:''));

  // 現場代理人・監理技術者
  sh.getRange('G37').setValue(dairi);
  sh.getRange('G39').setValue(kanri);

  // 下請業者（daikoデータ）
  var subs=p.subs?p.subs:[];
  if(caseId&&!subs.length){
    // actionsから取得済みのデータを使う（呼び出し元でセット）
  }
  if(subs.length){
    sh.getRange('AL40').setValue(subs[0]['会社名']||'');  // 一次下請1社目
  }

  // 自社社保（M56行）
  sh.getRange('M56').setValue(co);
  // 健保・年金・雇用は設定マスタに保険番号がないため現状空欄
}

// 再下請負通知書 流し込み
function saitakeFill_(sh,p,st){
  var now=new Date();
  var co=st['会社名']||COMPANY_NAME;
  var addr=st['会社住所']||'';
  var tel=st['会社電話']||'';
  var rep=st['代表者名']||'';
  var projName=String(p.projName||'');
  var prime=String(p.prime||'');  // 直近上位注文者名

  // 作成日
  sh.getRange('U3').setValue(wareki_(now).y);
  sh.getRange('X3').setValue(now.getMonth()+1);
  sh.getRange('Z3').setValue(now.getDate());

  // 報告下請負業者（自社）
  sh.getRange('AH6').setValue(co+'・'+(st['建設業許可番号']||''));
  sh.getRange('AV6').setValue(rep);
  sh.getRange('F7').setValue(prime||'');   // 直近上位注文者
  sh.getRange('F10').setValue(rep);        // 代表者
  sh.getRange('R10').setValue(addr);       // 住所
  sh.getRange('AH10').setValue(addr);
  if(tel){var t=tel.replace(/[^0-9]/g,'');sh.getRange('T11').setValue(t.slice(0,3));sh.getRange('W11').setValue(t.slice(3,6));sh.getRange('Z11').setValue(t.slice(6));}
  sh.getRange('E13').setValue(prime||'');  // 元請名
  sh.getRange('AH12').setValue(projName);  // 工事内容

  // 下請業者（subs）
  var subs=p.subs?p.subs:[];
  if(subs.length){
    var s=subs[0];
    sh.getRange('R14').setValue((s['会社名']||'')+'・'+(s['建設業許可番号']||''));
    sh.getRange('R15').setValue(s['代表者名']||'');
    sh.getRange('D27').setValue(s['工種']||'');
    sh.getRange('O27').setValue('');
  }
}

// 下請負業者編成表 流し込み
function henseiFill_(sh,p,st){
  var now=new Date();
  var co=st['会社名']||COMPANY_NAME;
  var subs=p.subs?p.subs:[];

  // 作成日
  sh.getRange('AE2').setValue(wareki_(now).y);
  sh.getRange('AI2').setValue(now.getMonth()+1);
  sh.getRange('AK2').setValue(now.getDate());

  // 一次下請（最初の1社）
  if(subs.length>0){
    var s1=subs[0];
    sh.getRange('L7').setValue(s1['工種']||'');
    sh.getRange('U7').setValue(s1['会社名']||'');
    sh.getRange('U9').setValue(s1['代表者名']||'');
    sh.getRange('U11').setValue(s1['建設業許可番号']||'');
    sh.getRange('U13').setValue(s1['主任技術者名']||'');
    sh.getRange('U15').setValue(s1['主任技術者名']||'');  // 安全衛生責任者
  }

  // 二次下請（最大3社、列G/T/AA）
  var nijiCols=['G','T','AA'];
  var niji=subs.slice(1,4);
  for(var i=0;i<niji.length;i++){
    var s=niji[i]; var col=nijiCols[i];
    var base=30; // 二次の開始行
    sh.getRange(col+base).setValue(s['会社名']||'');
    sh.getRange(col+(base+2)).setValue(s['代表者名']||'');
    sh.getRange(col+(base+4)).setValue(s['建設業許可番号']||'');
    sh.getRange(col+(base+6)).setValue(s['主任技術者名']||'');
    sh.getRange(col+(base+8)).setValue(s['主任技術者名']||'');
  }
}

// 和暦変換ヘルパー
function wareki_(d){
  var y=d.getFullYear();
  if(y>=2019||(y===2019&&d.getMonth()>=4))return{era:'令和',y:y-2018};
  if(y>=1989||(y===1989&&d.getMonth()>=0&&d.getDate()>=8))return{era:'平成',y:y-1988};
  return{era:'昭和',y:y-1925};
}


function buildSaitekuSheet_(sh,sub,children,proj,st){
  var NC=8; var cw=[25,90,90,90,90,90,90,90];
  for(var i=0;i<cw.length;i++)sh.setColumnWidth(i+1,cw[i]);
  sh.getRange(1,1,60,NC).setFontFamily('Noto Sans JP').setFontSize(8).setVerticalAlignment('middle');
  sh.getRange(1,1,1,NC).merge().setValue('再 下 請 負 通 知 書').setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center').setBackground('#1e3a5f').setFontColor('#fff');
  sh.setRowHeight(1,28);
  sh.getRange(2,1,1,NC).merge().setValue('（全建統一参考様式 第1号乙）').setFontSize(8).setHorizontalAlignment('center').setFontColor('#555');
  sh.setRowHeight(2,16);
  function section(row,title){ sh.getRange(row,1,1,NC).merge().setValue(title).setFontWeight('bold').setBackground('#2d4e7c').setFontColor('#fff').setFontSize(9); sh.setRowHeight(row,20); }
  function row2(row,lbl,val){ sh.getRange(row,1,1,2).merge().setValue(lbl).setFontWeight('bold').setBackground('#eef1f5').setFontSize(8); sh.getRange(row,3,1,NC-2).merge().setValue(val||'').setFontSize(9); sh.setRowHeight(row,18); }
  function row4(row,l1,v1,l2,v2){ sh.getRange(row,1).setValue(l1).setFontWeight('bold').setBackground('#eef1f5').setFontSize(8); sh.getRange(row,2,1,3).merge().setValue(v1||'').setFontSize(9); sh.getRange(row,5).setValue(l2).setFontWeight('bold').setBackground('#eef1f5').setFontSize(8); sh.getRange(row,6,1,NC-5).merge().setValue(v2||'').setFontSize(9); sh.setRowHeight(row,18); }
  var r=3;
  // 元請会社（宛先）
  sh.getRange(r,1,1,NC).merge().setValue('（宛先）　'+String(st['会社名']||'')+'　御中').setFontSize(10).setFontWeight('bold'); sh.setRowHeight(r,22); r++;
  sh.getRange(r,1,1,NC).merge().setValue('下記のとおり再下請負契約を締結したので通知します。').setFontSize(9); sh.setRowHeight(r,18); r++;
  // 通知者情報（一次下請）
  section(r,'■ 通知者（再下請を出す業者）'); r++;
  row2(r,'会社名',String(sub['会社名']||'')); r++;
  row2(r,'住所',String(sub['住所']||'')); r++;
  row4(r,'電話',String(sub['電話']||''),'建設業許可番号',String(sub['建設業許可番号']||'')); r++;
  row4(r,'代表者名',String(sub['代表者名']||''),'許可業種',String(sub['許可業種']||'')); r++;
  row4(r,'主任技術者',String(sub['主任技術者名']||''),'資格',String(sub['主任技術者資格']||'')); r++;
  // 元請との契約内容
  section(r,'■ 元請との請負契約'); r++;
  row4(r,'工事名',String(proj['案件名']||''),'工事場所',String(proj['場所']||'')); r++;
  row4(r,'工種',String(sub['工種']||''),'請負金額',String(sub['請負金額']||'')); r++;
  row4(r,'工期開始',String(sub['工期開始']||'').slice(0,10),'工期完了',String(sub['工期完了']||'').slice(0,10)); r++;
  // 再下請業者一覧
  section(r,'■ 再下請負業者'); r++;
  if(!children.length){ sh.getRange(r,1,1,NC).merge().setValue('（再下請負業者なし）').setFontSize(9).setHorizontalAlignment('center').setFontColor('#888'); sh.setRowHeight(r,18); r++; }
  else {
    var hdr=['No.','会社名','建設業許可番号','工種','請負金額','工期開始','工期完了','主任技術者'];
    sh.getRange(r,1,1,NC).setValues([hdr]).setFontWeight('bold').setBackground('#3d5c8a').setFontColor('#fff').setFontSize(8).setHorizontalAlignment('center'); sh.setRowHeight(r,20); r++;
    children.forEach(function(x,i){ sh.getRange(r,1,1,NC).setValues([[i+1,x['会社名']||'',x['建設業許可番号']||'',x['工種']||'',x['請負金額']||'',String(x['工期開始']||'').slice(0,10),String(x['工期完了']||'').slice(0,10),x['主任技術者名']||'']]); sh.setRowHeight(r,18); r++; }); }
  sh.getRange(3,1,r-3,NC).setBorder(true,true,true,true,true,true,'#aaaaaa',SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(r,1,1,NC).merge().setValue('作成日：'+ymd_()).setFontSize(7).setFontColor('#888').setHorizontalAlignment('right');
  sh.getRange(r+1,1,1,NC).merge().setValue('※本書は建設業法第24条の8に基づく通知書です。').setFontSize(7).setFontColor('#888');
}

// ===== 書類管理（v57）: 資格の写し・許可票など =====
function docList_(p){
  var type=String(p.type||''), targetId=String(p.targetId||'');
  var all=readAll_(SHEET_DOCS,DOC_HEADERS,'書類ID');
  if(type)all=all.filter(function(x){return String(x['種別']||'')===type;});
  if(targetId)all=all.filter(function(x){return String(x['対象ID']||'')===targetId;});
  all.sort(function(a,b){return String(b['登録日時']||'').localeCompare(String(a['登録日時']||''));});
  return {ok:true,docs:all};
}
function docUpload_(p){
  var type=String(p.type||''), targetId=String(p.targetId||''), name=String(p.name||'doc'), mime=String(p.mime||'application/octet-stream');
  if(!p.data)throw '書類データが空です';
  // Drive フォルダを取得または作成
  var parent=getParent_();
  var typeFolder; // 種別フォルダ
  if(type==='worker')typeFolder=ensureSub_(parent,'社員書類');
  else if(type==='sub')typeFolder=ensureSub_(parent,'協力業者書類');
  else typeFolder=ensureSub_(parent,'会社書類');
  // 対象IDのサブフォルダ（worker/subの場合）
  var dest;
  if(type==='company'){
    dest=typeFolder;
  } else {
    var label=targetId||'unknown';
    // 対象名をラベルに使う
    if(type==='worker'){var ws=listWorkers_().filter(function(x){return String(x['作業員ID'])===label;});if(ws.length)label=String(ws[0]['氏名']||label);}
    else if(type==='sub'){var ss=readAll_(SHEET_DAIKO,DAIKO_HEADERS,'下請ID').filter(function(x){return String(x['下請ID'])===label;});if(ss.length)label=String(ss[0]['会社名']||label);}
    dest=ensureSub_(typeFolder,label);
  }
  var blob=Utilities.newBlob(Utilities.base64Decode(p.data),mime,name);
  var file=dest.createFile(blob);
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  var id=uid_('DC'); var now=new Date();
  var rec={'書類ID':id,'種別':type,'対象ID':targetId,'書類名':name,'DriveFileId':file.getId(),'DriveFileUrl':file.getUrl(),'MIME':mime,'備考':String(p.note||''),'登録日時':now};
  var sh=sheet_(SHEET_DOCS); ensureColumns_(sh,DOC_HEADERS);
  sh.appendRow(DOC_HEADERS.map(function(k){return rec[k]!=null?rec[k]:''; }));
  return {ok:true,doc:rec};
}
function docDelete_(p){
  var id=String(p.id||''), delFile=p.delFile!==false;
  var sh=sheet_(SHEET_DOCS); var vals=sh.getDataRange().getValues();
  var col=DOC_HEADERS.indexOf('書類ID'), fid=DOC_HEADERS.indexOf('DriveFileId');
  for(var i=vals.length-1;i>=1;i--){
    if(String(vals[i][col])===id){
      if(delFile&&vals[i][fid]){try{DriveApp.getFileById(String(vals[i][fid])).setTrashed(true);}catch(e){}}
      sh.deleteRow(i+1);
      return {ok:true};
    }
  }
  return {ok:false,error:'not found'};
}

// ========== AI見積もりOCR（Gemini API・UrlFetchApp） ==========
function aiOcrEstimate_(base64Data, mimeType) {
  if(!base64Data) return {ok:false, error:'データがありません'};
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if(!apiKey) return {ok:false, error:'スクリプトプロパティに GEMINI_API_KEY が設定されていません'};
  var prompt = 'これは建設業（電気・建築・水道・空調設備・塗装・内装など）の手書き見積書です。記載されている明細を正確に読み取ってください。'
    + 'レスポンスは必ずJSON形式のみで返してください（前置き・説明文は不要）。'
    + '形式: {"items":[{"n":"品名・仕様","q":数量,"u":"単位","p":単価},...], "subject":"工事名や件名があれば", "atena":"宛先会社名があれば"} '
    + 'q（数量）とp（単価）は数値。単位は「式」「個」「m」「m2」「m3」「本」「ヶ所」「台」「枚」「箇所」「人工」「kg」「袋」「缶」「巻」などの文字列。'
    + '金額列がある場合、単価×数量=金額になるよう確認してください。読み取れない項目は空文字または0にしてください。'
    + '【重要】これは建設工事の見積書です。以下の建設業の専門用語を踏まえて、手書き文字を正しく解釈してください：'
    + '◆電気工事：漏電ブレーカー（NV-）、配線用遮断器（NF-）、VVFケーブル/電線、プラモール、モールボックス、ジョイントボックス、スイッチ、接地コンセント、ダウンライト、人感センサー、分電盤、照明器具。'
    + '◆建築工事：石膏ボード、ベニヤ、合板、間柱、野縁、フローリング、クロス、巾木、廻り縁、建具、サッシ、断熱材、基礎、型枠、鉄筋、生コン。'
    + '◆水道・給排水：塩ビ管（VP・VU）、継手、エルボ、チーズ、ソケット、止水栓、給水栓、混合水栓、便器、洗面台、排水トラップ、フレキ管、量水器。'
    + '◆空調・設備：エアコン、ダクト、冷媒管、ドレン、換気扇、レンジフード、給湯器、ボイラー、配管、保温材。'
    + '◆塗装工事：シーラー、プライマー、下塗り、中塗り、上塗り、ローラー、養生、ケレン、サンディング、塗料（缶・kg単位）。'
    + '◆共通：足場、雑材料、消耗品、運搬費、産廃処分費、諸経費。'
    + '【誤読しやすい例（必ず正しい方に補正）】「トイル→トイレ」「海電→漏電」「電打→電灯」「ケ所→ヶ所」「林→枠」「塩ヒ→塩ビ」。'
    + 'カタカナの「レ」と「ル」、漢字の「漏」と「海」を特に間違えやすいので注意してください。'
    + '【型番の扱い】「NT-」は「NV-」（漏電ブレーカー）の誤読が多い。型番や電線の規格（VA1.6×2C、VVF2.0×2C+G、LGDC1102NKLE1など）は、'
    + '勝手に省略・並べ替え・数字変更をせず、書かれている文字をそのまま忠実に書き写してください。例えば「VA1.6×2C」を「VAR6×20」のように変形しないこと。'
    + '型番末尾の数字（…NKLE1の1など）も省略しないこと。'
    + '品名は建設工事の文脈で意味が通る正しい用語に補正しつつ、型番・規格・数値は原文に忠実にしてください。';
  var body = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType, data: base64Data } },
        { text: prompt }
      ]
    }]
  };
  var resp;
  try {
    resp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      { method:'post', contentType:'application/json', payload:JSON.stringify(body), muteHttpExceptions:true }
    );
  } catch(e) { return {ok:false, error:'API通信エラー: '+e.message}; }
  var code = resp.getResponseCode();
  var json;
  try { json = JSON.parse(resp.getContentText()); } catch(e) { return {ok:false, error:'レスポンスのパースに失敗しました'}; }
  // 200以外、または本文にerrorが含まれる場合はエラー（Geminiは200でもerror本文を返すことがある）
  if(code !== 200 || (json && json.error)) return {ok:false, error:(json&&json.error&&json.error.message)||('APIエラー('+code+')')};
  // candidatesが無い／空（無効ファイル・ブロック等）の検知
  if(!json.candidates || !json.candidates[0]) {
    var fr0=(json.promptFeedback&&json.promptFeedback.blockReason)||'';
    return {ok:false, error:'読み取り結果が空でした。'+(fr0?('（'+fr0+'）'):'PDFが空でないか、画像が鮮明かをご確認ください。')};
  }
  var cand = json.candidates[0];
  var text = (cand.content&&cand.content.parts&&cand.content.parts[0]&&cand.content.parts[0].text)||'';
  if(!text){
    var fr=(cand.finishReason)||'';
    return {ok:false, error:'文字を読み取れませんでした。'+(fr?('（'+fr+'）'):'画像が鮮明な見積書・発注書かご確認ください。')};
  }
  var match = text.match(/\{[\s\S]*\}/);
  if(!match) return {ok:false, error:'明細データの形式を認識できませんでした。別の画像でお試しください。'};
  try {
    var parsed = JSON.parse(match[0]);
    if(!Array.isArray(parsed.items)) return {ok:false, error:'明細が見つかりませんでした。見積書・発注書の画像かご確認ください。'};
    return {ok:true, items:parsed.items, subject:parsed.subject||'', atena:parsed.atena||''};
  } catch(e) { return {ok:false, error:'明細データの解析に失敗しました: '+e.message}; }
}

// ========== AI案件OCR（PDF/画像→案件情報を抽出） v95 ==========
function aiOcrProject_(base64Data, mimeType) {
  if(!base64Data) return {ok:false, error:'データがありません'};
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if(!apiKey) return {ok:false, error:'スクリプトプロパティに GEMINI_API_KEY が設定されていません'};
  var prompt = 'これは建設工事の見積書・発注書・注文書・契約書などの書類です。'
    + '次の項目を読み取り、必ずJSON形式のみで返してください（前置き・説明文・コードブロック記号は一切不要）。'
    + '形式: {'
    + '"案件名":"工事の名前そのもの（例：○○邸新築電気工事、△△ビル空調設備改修工事）",'
    + '"顧客名":"発注者・注文者・依頼主の会社名や氏名",'
    + '"場所":"工事を行う住所だけ（例：愛知県一宮市本町1-2-3）",'
    + '"工期開始":"着工日 YYYY-MM-DD（不明なら空文字）",'
    + '"工期完了":"完了日・納期 YYYY-MM-DD（不明なら空文字）",'
    + '"受注金額税抜":税抜金額の数値（不明なら0）,'
    + '"受注金額税込":税込金額の数値（不明なら0）,'
    + '"備考":"工事概要・特記事項など（あれば短く）"'
    + '} '
    + '【案件名と場所の区別 ― 最重要】'
    + '・「案件名」には“工事の名前”だけを入れる。「工事名」「件名」「工事件名」「物件名」「工事名称」などのラベルの値がこれにあたる。'
    + '・「場所」には“住所”だけを入れる。「工事場所」「現場住所」「施工場所」「所在地」などのラベルの値で、都道府県・市区町村・番地などの住所表記がこれにあたる。'
    + '・絶対に取り違えないこと。工事名を「場所」に入れてはいけない。住所を「案件名」に入れてはいけない。'
    + '・判定の目安：地名・丁目・番地・建物名などの住所らしい表記＝場所。「○○工事」「○○改修」「新築」「更新」などで終わる語句＝案件名。'
    + '・もし1つの欄に工事名と住所が混在している場合は、工事名の部分だけを「案件名」へ、住所の部分だけを「場所」へ分けて入れる。'
    + '・「工事名」ラベルが見当たらない場合は、書類のタイトルや件名から工事名を推定して案件名に入れる（住所はそこに含めない）。'
    + '【その他のルール】'
    + '・顧客名は発注者・注文者・お客様であり、書類を作成した側（施工者・自社）ではない。「御中」「様」が付く宛名が顧客であることが多い。'
    + '・金額は税抜と税込を区別する。片方しかない場合は税率10%で計算して補完してよい（税抜→税込は×1.1、税込→税抜は÷1.1して四捨五入）。'
    + '・日付は書類に明記がある場合のみ。推測で日付を作らない（不明なら空文字）。'
    + '・「工期」「工事期間」が「○月○日〜○月○日」の形なら開始と完了に分ける。年が無ければ書類の発行年を使ってよい。'
    + '・住所は省略せず、書かれている通りに都道府県・市区町村・番地まで記載する。'
    + '・読み取れない項目は空文字または0にする。存在しない情報を創作しない。';
  var body = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType, data: base64Data } },
        { text: prompt }
      ]
    }]
  };
  var resp;
  try {
    resp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      { method:'post', contentType:'application/json', payload:JSON.stringify(body), muteHttpExceptions:true }
    );
  } catch(e) { return {ok:false, error:'API通信エラー: '+e.message}; }
  var code = resp.getResponseCode();
  var json;
  try { json = JSON.parse(resp.getContentText()); } catch(e) { return {ok:false, error:'レスポンスのパースに失敗しました'}; }
  if(code !== 200 || (json && json.error)) return {ok:false, error:(json&&json.error&&json.error.message)||('APIエラー('+code+')')};
  if(!json.candidates || !json.candidates[0]) {
    var fr0=(json.promptFeedback&&json.promptFeedback.blockReason)||'';
    return {ok:false, error:'読み取り結果が空でした。'+(fr0?('（'+fr0+'）'):'PDFが空でないか、画像が鮮明かをご確認ください。')};
  }
  var cand = json.candidates[0];
  var text = (cand.content&&cand.content.parts&&cand.content.parts[0]&&cand.content.parts[0].text)||'';
  if(!text){
    var fr=(cand.finishReason)||'';
    return {ok:false, error:'文字を読み取れませんでした。'+(fr?('（'+fr+'）'):'鮮明な書類の画像かご確認ください。')};
  }
  var match = text.match(/\{[\s\S]*\}/);
  if(!match) return {ok:false, error:'書類の内容を認識できませんでした。別の画像でお試しください。'};
  try {
    var parsed = JSON.parse(match[0]);
    return {ok:true, data:parsed};
  } catch(e) { return {ok:false, error:'読み取りデータの解析に失敗しました: '+e.message}; }
}



// ========== 材料系AI・検索（v143） ==========
// materiallist/materialsearch 画面から呼ばれる action の不足を補修。
// GEMINI_API_KEY が未設定でも、商品マスタのキーワード検索は動くようにしています。
function productToMaterialResult_(p){
  p=p||{};
  return {
    n: String(p['商品名']||p['品名']||''),
    model: String(p['規格']||''),
    maker: String(p['メーカー']||p['標準仕入先']||''),
    spec: String(p['規格']||''),
    price: p['単価']||'',
    productId: p['商品ID']||'',
    unit: p['単位']||'',
    supplier: p['標準仕入先']||''
  };
}
function materialLocalSearch_(q, limit){
  q=String(q||'').trim().toLowerCase();
  limit=Math.max(1,Math.min(Number(limit||20),50));
  var words=q.split(/[\s　]+/).filter(Boolean);
  var rows=[];
  try{ rows=listProducts_()||[]; }catch(e){ rows=[]; }
  var scored=[];
  rows.forEach(function(p){
    var text=[p['商品名'],p['規格'],p['単位'],p['標準仕入先'],p['メモ'],p['置き場所']].join(' ').toLowerCase();
    var score=0;
    if(!words.length) score=1;
    words.forEach(function(w){ if(text.indexOf(w)>=0) score+=10; });
    if(q && text.indexOf(q)>=0) score+=20;
    if(score>0) scored.push({score:score,item:productToMaterialResult_(p)});
  });
  scored.sort(function(a,b){return b.score-a.score;});
  return scored.slice(0,limit).map(function(x){return x.item;});
}
function parseFirstJson_(text){
  text=String(text||'').replace(/```json|```/g,'').trim();
  var m=text.match(/\{[\s\S]*\}/);
  if(!m) throw new Error('JSON形式を認識できませんでした');
  return JSON.parse(m[0]);
}
function geminiGenerateJson_(parts, prompt){
  var apiKey=PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if(!apiKey) return {ok:false,error:'スクリプトプロパティに GEMINI_API_KEY が設定されていません'};
  var body={contents:[{parts:(parts||[]).concat([{text:prompt}])}]};
  var resp;
  try{
    resp=UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+apiKey,{method:'post',contentType:'application/json',payload:JSON.stringify(body),muteHttpExceptions:true});
  }catch(e){return {ok:false,error:'API通信エラー: '+e.message};}
  var code=resp.getResponseCode(), json;
  try{json=JSON.parse(resp.getContentText());}catch(e){return {ok:false,error:'レスポンスのパースに失敗しました'};}
  if(code!==200 || (json&&json.error)) return {ok:false,error:(json&&json.error&&json.error.message)||('APIエラー('+code+')')};
  var cand=json.candidates&&json.candidates[0];
  var text='';
  if(cand&&cand.content&&cand.content.parts){cand.content.parts.forEach(function(p){if(p.text)text+=p.text;});}
  if(!text) return {ok:false,error:'AIの回答が空でした'};
  try{return {ok:true,data:parseFirstJson_(text),raw:text};}catch(e){return {ok:false,error:'AI回答のJSON解析に失敗しました: '+e.message,raw:text};}
}
function materialOcr_(base64Data, mimeType){
  if(!base64Data) return {ok:false,error:'画像データがありません'};
  var prompt='これは建設現場で使う材料リスト・納品書・手書きメモ・写真です。材料名、数量、単位を読み取り、必ずJSONのみで返してください。形式: {"items":[{"n":"材料名","q":"数量","u":"単位"}]}。読み取れない場合はitemsを空配列にしてください。電気工事の材料（VVF、CV、PF管、VE管、ブレーカー、配線器具、照明、ボックス、端子、圧着端子等）を優先して解釈してください。';
  var r=geminiGenerateJson_([{inline_data:{mime_type:mimeType||'image/jpeg',data:base64Data}}],prompt);
  if(!r.ok) return r;
  var items=(r.data&&Array.isArray(r.data.items))?r.data.items:[];
  items=items.map(function(x){return {n:String(x.n||x.name||x['材料名']||''),q:String(x.q||x.qty||x['数量']||''),u:String(x.u||x.unit||x['単位']||'')};}).filter(function(x){return x.n;});
  return {ok:true,items:items};
}
function materialSearch_(q){
  q=String(q||'').trim();
  if(!q) return {ok:false,error:'検索ワードがありません'};
  var local=materialLocalSearch_(q,20);
  var sources=[];
  if(local.length) sources.push({title:'商品マスタ',url:''});
  // API未設定でも商品マスタ検索として使えるように、ここで一旦返す。
  // 将来GEMINI_API_KEYを設定している場合は、AIで候補拡張する余地を残す。
  return {ok:true,results:local.length?local:[{n:q,model:'',maker:'',spec:'',price:''}],sources:sources};
}
function materialIdentify_(base64Data, mimeType){
  if(!base64Data) return {ok:false,error:'画像データがありません'};
  var prompt='これは建設現場で使う材料・部材の写真です。材料名、型番、メーカー、規格を推定し、必ずJSONのみで返してください。形式: {"results":[{"n":"材料名","model":"型番","maker":"メーカー","spec":"規格","price":""}]}。断定できない場合は候補を最大5件にしてください。';
  var r=geminiGenerateJson_([{inline_data:{mime_type:mimeType||'image/jpeg',data:base64Data}}],prompt);
  if(!r.ok) return r;
  var results=(r.data&&Array.isArray(r.data.results))?r.data.results:[];
  results=results.map(function(x){return {n:String(x.n||x.name||x['材料名']||''),model:String(x.model||x['型番']||''),maker:String(x.maker||x['メーカー']||''),spec:String(x.spec||x['規格']||''),price:String(x.price||x['価格']||'')};}).filter(function(x){return x.n||x.model;});
  return {ok:true,results:results,sources:[]};
}

// ========== AI汎用チャット（Gemini API・UrlFetchApp） ==========
var AI_SYSTEM_PROMPT = 'あなたは親切なAIアシスタントです。日本語で簡潔に答えてください。'
  + '前置きや挨拶は省き、要点だけを短くまとめること。'
  + '長い説明より、結論を先に短く伝えることを優先してください。';
function aiChat_(messages, systemPrompt) {
  if(!Array.isArray(messages)||messages.length===0) return {ok:false,error:'メッセージがありません'};
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if(!apiKey) return {ok:false, error:'スクリプトプロパティに GEMINI_API_KEY が設定されていません'};
  // systemPromptが空ならGAS側のデフォルトを使う（URL長対策でフロントから送らない運用）
  if(!systemPrompt) systemPrompt = AI_SYSTEM_PROMPT;
  var trimmed = messages.slice(-40);
  // Gemini用コンテンツ配列（会話履歴）
  var contents = [];
  trimmed.forEach(function(m, i) {
    var role = (m.role === 'assistant') ? 'model' : 'user';
    var text = String(m.content || '');
    if(i === 0 && role === 'user' && systemPrompt) {
      text = '[システム設定] ' + systemPrompt + ' [質問] ' + text;
    }
    contents.push({ role: role, parts: [{ text: text }] });
  });
  // Google検索連携（grounding）を有効化。最新情報や型番などを検索して回答する
  var body = { contents: contents, tools: [{ google_search: {} }] };
  var resp;
  try {
    resp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      { method:'post', contentType:'application/json', payload:JSON.stringify(body), muteHttpExceptions:true }
    );
  } catch(e) { return {ok:false, error:'API通信エラー: '+e.message}; }
  var code = resp.getResponseCode();
  var json;
  try { json = JSON.parse(resp.getContentText()); } catch(e) { return {ok:false, error:'レスポンスのパースに失敗しました'}; }
  if(code !== 200) return {ok:false, error:(json&&json.error&&json.error.message)||'APIエラー('+code+')'};
  var cand = json.candidates && json.candidates[0];
  // 回答テキスト（複数partsを連結）
  var text = '';
  if(cand && cand.content && cand.content.parts){
    cand.content.parts.forEach(function(p){ if(p.text) text += p.text; });
  }
  // 出典（groundingMetadataのgroundingChunksからWebサイトのURL・タイトルを抽出）
  var sources = [];
  try {
    var gm = cand && cand.groundingMetadata;
    if(gm && gm.groundingChunks){
      gm.groundingChunks.forEach(function(ch){
        if(ch.web && ch.web.uri){
          sources.push({ title: ch.web.title || ch.web.uri, url: ch.web.uri });
        }
      });
    }
  } catch(e){}
  return {ok:true, text:text, sources:sources};
}
