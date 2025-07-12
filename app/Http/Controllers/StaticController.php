<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Product;
use App\Models\Category;
use App\Models\AmazonReview;
use App\Models\AmazonImages;
use App\Models\SuggestedCategorySet;

class StaticController extends Controller
{
    public function storeMultipleAmazonProducts()
        {
            set_time_limit(500); // Allow the script to run indefinitely
            $amazonLinks = [
                'https://www.amazon.com/AmazonBasics-8-Piece-Non-Stick-Kitchen-Cookware/dp/B074817DK1/ref=sr_1_1_ffob_sspa?_encoding=UTF8&content-id=amzn1.sym.8158743a-e3ec-4239-b3a8-31bfee7d4a15&dib=eyJ2IjoiMSJ9.lU8DYi6GP_YOhAQfIY2h-L_jJiiHHSe20S18Q7iWYI0qeDsT30Wn5hn4J8_QS36jaPCht1BvhN8zdskZ2IMxre4e8dgzn7ZU5VLvY9MjkX1ivRCoIX0_XsGArsF1gNo-Byj3FZSoSUTJcuq1wcHFZ7ItSc-JetpaRW0eaBVz47-5pLjmUfNI4r01KzDcqfYHp8hyihUkz95KHf04wa5c26yhEEribC6zrAirAJgeuxbxvwwLbi3R2q-P0-TB35XWPFjnUd20bz2S3Zie6cPkdN6GgcEFQbO0s8emTLh4laU.Kg2DqRBbgsZaUVi6Otvdd3oGfiJzBN3BCX1KWSPzblY&dib_tag=se&keywords=pots%2Band%2Bpans&pd_rd_r=5821d908-b332-436c-bae8-051dc113a1ac&pd_rd_w=jX4A4&pd_rd_wg=Az8RS&qid=1752329620&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1',
                'https://www.amazon.com/Refresh-Cookware-Saucepans-Utensils-Nonstick/dp/B0D1DB333K/ref=sr_1_2_sspa?_encoding=UTF8&content-id=amzn1.sym.8158743a-e3ec-4239-b3a8-31bfee7d4a15&dib=eyJ2IjoiMSJ9.lU8DYi6GP_YOhAQfIY2h-L_jJiiHHSe20S18Q7iWYI0qeDsT30Wn5hn4J8_QS36jaPCht1BvhN8zdskZ2IMxre4e8dgzn7ZU5VLvY9MjkX1ivRCoIX0_XsGArsF1gNo-Byj3FZSoSUTJcuq1wcHFZ7ItSc-JetpaRW0eaBVz47-5pLjmUfNI4r01KzDcqfYHp8hyihUkz95KHf04wa5c26yhEEribC6zrAirAJgeuxbxvwwLbi3R2q-P0-TB35XWPFjnUd20bz2S3Zie6cPkdN6GgcEFQbO0s8emTLh4laU.Kg2DqRBbgsZaUVi6Otvdd3oGfiJzBN3BCX1KWSPzblY&dib_tag=se&keywords=pots%2Band%2Bpans&pd_rd_r=5821d908-b332-436c-bae8-051dc113a1ac&pd_rd_w=jX4A4&pd_rd_wg=Az8RS&qid=1752329620&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1',
                'https://www.amazon.com/T-fal-Signature-Dishwasher-Thermo-Spot-Indicator/dp/B001167VIQ/ref=sr_1_3_sspa?_encoding=UTF8&content-id=amzn1.sym.8158743a-e3ec-4239-b3a8-31bfee7d4a15&dib=eyJ2IjoiMSJ9.lU8DYi6GP_YOhAQfIY2h-L_jJiiHHSe20S18Q7iWYI0qeDsT30Wn5hn4J8_QS36jaPCht1BvhN8zdskZ2IMxre4e8dgzn7ZU5VLvY9MjkX1ivRCoIX0_XsGArsF1gNo-Byj3FZSoSUTJcuq1wcHFZ7ItSc-JetpaRW0eaBVz47-5pLjmUfNI4r01KzDcqfYHp8hyihUkz95KHf04wa5c26yhEEribC6zrAirAJgeuxbxvwwLbi3R2q-P0-TB35XWPFjnUd20bz2S3Zie6cPkdN6GgcEFQbO0s8emTLh4laU.Kg2DqRBbgsZaUVi6Otvdd3oGfiJzBN3BCX1KWSPzblY&dib_tag=se&keywords=pots%2Band%2Bpans&pd_rd_r=5821d908-b332-436c-bae8-051dc113a1ac&pd_rd_w=jX4A4&pd_rd_wg=Az8RS&qid=1752329620&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1',
                'https://www.amazon.com/OnePlus-Smartphone-Snapdragon-SUPERVOOC-Hasselblad/dp/B0DP8K352S/ref=sr_1_1_sspa?crid=1O7PKB55WT9RZ&dib=eyJ2IjoiMSJ9.8W2ur_5Mq1a9Aezw1G8_t3GkmpxbQry-K915p9iH3WoupibTqiRsEKNP1_ds24Xic4OE4GwK0bK_lCh2AMiV7Zo_br9ywFOmj1cpA_fLj1ybwN6ssc7stUMkDBb9GzrDKOOKbSWAzB7GbCCrWPTzROkhZxQuO9FFCL-EL0wfPKtv2jwxHeo32EsvNfo6YZnLm5UtqhDdsf4MvOFsfff2GcB1QCbx0RFCLEd-HDv3R_I.EAyyLY7jC5b-pTe6NFxzd9-IzEBp219si1zNAtoszC4&dib_tag=se&keywords=phone&qid=1752329650&sprefix=pho%2Caps%2C466&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1',
                'https://www.amazon.com/Battery-Unlocked-AMOLED-Version-Warranty/dp/B0D897WH4K/ref=sr_1_2_sspa?crid=1O7PKB55WT9RZ&dib=eyJ2IjoiMSJ9.8W2ur_5Mq1a9Aezw1G8_t3GkmpxbQry-K915p9iH3WoupibTqiRsEKNP1_ds24Xic4OE4GwK0bK_lCh2AMiV7Zo_br9ywFOmj1cpA_fLj1ybwN6ssc7stUMkDBb9GzrDKOOKbSWAzB7GbCCrWPTzROkhZxQuO9FFCL-EL0wfPKtv2jwxHeo32EsvNfo6YZnLm5UtqhDdsf4MvOFsfff2GcB1QCbx0RFCLEd-HDv3R_I.EAyyLY7jC5b-pTe6NFxzd9-IzEBp219si1zNAtoszC4&dib_tag=se&keywords=phone&qid=1752329650&sprefix=pho%2Caps%2C466&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1',
                'https://www.amazon.com/SAMSUNG-Unlocked-Smartphone-Charging-Expandable/dp/B0DLHNWHRF/ref=sr_1_3?crid=1O7PKB55WT9RZ&dib=eyJ2IjoiMSJ9.8W2ur_5Mq1a9Aezw1G8_t3GkmpxbQry-K915p9iH3WoupibTqiRsEKNP1_ds24Xic4OE4GwK0bK_lCh2AMiV7Zo_br9ywFOmj1cpA_fLj1ybwN6ssc7stUMkDBb9GzrDKOOKbSWAzB7GbCCrWPTzROkhZxQuO9FFCL-EL0wfPKtv2jwxHeo32EsvNfo6YZnLm5UtqhDdsf4MvOFsfff2GcB1QCbx0RFCLEd-HDv3R_I.EAyyLY7jC5b-pTe6NFxzd9-IzEBp219si1zNAtoszC4&dib_tag=se&keywords=phone&qid=1752329650&sprefix=pho%2Caps%2C466&sr=8-3&th=1',
                'https://www.amazon.com/Morostron-Portable-Expandable-Quad-core-Interface/dp/B0DP4Y6LG1/ref=sr_1_1_sspa?crid=871C2JMR2231&dib=eyJ2IjoiMSJ9.p0YFvPtAGfAO7TYdpneavQftb9I4u6Z-IcNIdQIy8Q37HvmeQcvkkCEPE-jU7XZW2sEWgUByXupqbZE_HxSC4ByWIrYR1b_VQMphKvCRwG2SJKorOE3agaY_G7Wg6jAROpFhYn5xDKero9FQrpbS7A4mC-6-WQhaz93JWAg96PrPcxvB21n8LVroZz9M0jElIhJn4Ysy2kqWFib3QfC0y-Wjyb0N_Ctgt_3Mn7X5Sq8.67uWbCvwYYoDcb4rrIVgVVRO1wizmEJMVVVnoTC_Bmo&dib_tag=se&keywords=laptop&qid=1752329662&sprefix=laptop%2Caps%2C417&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1',
                'https://www.amazon.com/Akocrsiy-15-6-inch-Student-Computer-i5-7200U/dp/B0DGFX1HQ6/ref=sr_1_2_sspa?crid=871C2JMR2231&dib=eyJ2IjoiMSJ9.p0YFvPtAGfAO7TYdpneavQftb9I4u6Z-IcNIdQIy8Q37HvmeQcvkkCEPE-jU7XZW2sEWgUByXupqbZE_HxSC4ByWIrYR1b_VQMphKvCRwG2SJKorOE3agaY_G7Wg6jAROpFhYn5xDKero9FQrpbS7A4mC-6-WQhaz93JWAg96PrPcxvB21n8LVroZz9M0jElIhJn4Ysy2kqWFib3QfC0y-Wjyb0N_Ctgt_3Mn7X5Sq8.67uWbCvwYYoDcb4rrIVgVVRO1wizmEJMVVVnoTC_Bmo&dib_tag=se&keywords=laptop&qid=1752329662&sprefix=laptop%2Caps%2C417&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1',
                'https://www.amazon.com/Lenovo-IdeaPad-Microsoft-Business-Anti-Glare/dp/B0F8PDCWT3/ref=sr_1_3?crid=871C2JMR2231&dib=eyJ2IjoiMSJ9.p0YFvPtAGfAO7TYdpneavQftb9I4u6Z-IcNIdQIy8Q37HvmeQcvkkCEPE-jU7XZW2sEWgUByXupqbZE_HxSC4ByWIrYR1b_VQMphKvCRwG2SJKorOE3agaY_G7Wg6jAROpFhYn5xDKero9FQrpbS7A4mC-6-WQhaz93JWAg96PrPcxvB21n8LVroZz9M0jElIhJn4Ysy2kqWFib3QfC0y-Wjyb0N_Ctgt_3Mn7X5Sq8.67uWbCvwYYoDcb4rrIVgVVRO1wizmEJMVVVnoTC_Bmo&dib_tag=se&keywords=laptop&qid=1752329662&sprefix=laptop%2Caps%2C417&sr=8-3&th=1',
                'https://www.amazon.com/Amazon-Essentials-Womens-Dress-Large/dp/B097K6GXYX/ref=sr_1_1_ffob_sspa?_encoding=UTF8&content-id=amzn1.sym.bc6e892c-a9fc-4672-99a1-592a1c3e66ca&crid=1PW0S93CC85GY&dib=eyJ2IjoiMSJ9._0h6kUs9BFUWs13TZpX-iVwX47t4vXzKhBBE0_c_v4OCWoWW_Qzdx0pJt03sRMY-eeH5YhjplNvqi7fHybywjVG4ywTpBq3dD6_IUaKgxqOS0OYZt-0mDLfcjZaWxd6K4ywYANvj-kk3SohVHEo23mCJ7YIbpRvWgJm7jVoKNrXUHb-A_ma3vGJVGSP5DoTc8W-up9wFVKG7WnDd5R9-xY9PWJOu-gKK3Wh8-UBGCCN821wYu2MYimhzjifncmBzdtv0h9Hd7IQeF_Jn68hFiN5fMa6RmNSX1YdJzUllZtA.Y0941j3APpJdIJyGFo_kzLzEbcbhZFY0wPMkRJ6iGag&dib_tag=se&keywords=Dresses&pd_rd_r=2174133f-5167-4425-b06d-30315d8856cd&pd_rd_w=RWC7k&pd_rd_wg=xfOmB&qid=1752329684&sprefix=dresses%2Caps%2C146&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&psc=1',
                'https://www.amazon.com/PRETTYGARDEN-Summer-Dresses-Vacation-Pockets/dp/B0DL2WTB4F/ref=sr_1_6?_encoding=UTF8&content-id=amzn1.sym.bc6e892c-a9fc-4672-99a1-592a1c3e66ca&crid=1PW0S93CC85GY&dib=eyJ2IjoiMSJ9._0h6kUs9BFUWs13TZpX-iVwX47t4vXzKhBBE0_c_v4OCWoWW_Qzdx0pJt03sRMY-eeH5YhjplNvqi7fHybywjVG4ywTpBq3dD6_IUaKgxqOS0OYZt-0mDLfcjZaWxd6K4ywYANvj-kk3SohVHEo23mCJ7YIbpRvWgJm7jVoKNrXUHb-A_ma3vGJVGSP5DoTc8W-up9wFVKG7WnDd5R9-xY9PWJOu-gKK3Wh8-UBGCCN821wYu2MYimhzjifncmBzdtv0h9Hd7IQeF_Jn68hFiN5fMa6RmNSX1YdJzUllZtA.Y0941j3APpJdIJyGFo_kzLzEbcbhZFY0wPMkRJ6iGag&dib_tag=se&keywords=Dresses&pd_rd_r=2174133f-5167-4425-b06d-30315d8856cd&pd_rd_w=RWC7k&pd_rd_wg=xfOmB&qid=1752329684&sprefix=dresses%2Caps%2C146&sr=8-6',
                'https://www.amazon.com/J-Ver-Shirts-Stretch-Wrinkle-Free-Regular/dp/B09VPVM1LF/ref=sxin_17_pa_sp_search_thematic_sspa?_encoding=UTF8&content-id=amzn1.sym.22cb88de-cad9-41ab-a67c-1e3c61622cdc%3Aamzn1.sym.22cb88de-cad9-41ab-a67c-1e3c61622cdc&crid=1PW0S93CC85GY&cv_ct_cx=Dresses&keywords=Dresses&pd_rd_i=B09VPVM1LF&pd_rd_r=61dba67c-7d21-47d3-98c5-f02c59fc62d7&pd_rd_w=Yojnz&pd_rd_wg=HzCLe&pf_rd_p=22cb88de-cad9-41ab-a67c-1e3c61622cdc&pf_rd_r=B5A86M8XJHQZ50EZN66C&qid=1752329684&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=dresses%2Caps%2C146&sr=1-2-4a82bf2c-99de-49d4-8c6e-1b9c06d4b176-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&psc=1',
                'https://www.amazon.com/Astercook-Kitchen-Dishwasher-Sharpener-Stainless/dp/B0BW91HX7D/ref=sr_1_13_sspa?_encoding=UTF8&content-id=amzn1.sym.5d0c6367-faf2-4a6d-abef-5547b5a67981&crid=2LRTV3593NEHX&dib=eyJ2IjoiMSJ9.1CIlJUVJ9KjQGMgn2dTFxTV1cbKE1egsr0NRVPQVeyShJM7gD8xME7uMJdaptQwmINliNxrXJb3KaUg0lRdAj9Mp0Z_ab_P9VoJ_XiTpDKcfTlBPOgCUybZ-pAWX91HkZwTp3LjU-zI0wbGDa4iHnXmVKeHP4l34OUeNB64LmyaofYEM_YFDpZh5R21jmitUk5VQwKwxPaFrh6tzXP26ZJ571gfHKE0O_LZGm2cjQNNRTtuFWLQKLoraerXmv6JDXQR0sxyPRKzRUt81Csc5-ATGWxARMevH9N425ENuIC0.2Q8enSHFwzNM7HRviDXDAQYQHTD7rCUxmlxVatanUx8&dib_tag=se&keywords=Kitchen&pd_rd_r=2174133f-5167-4425-b06d-30315d8856cd&pd_rd_w=L5xEu&pd_rd_wg=xfOmB&qid=1752329702&s=kitchen-intl-ship&sprefix=kitchen%2Ckitchen-intl-ship%2C202&sr=1-13-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1',
                'https://www.amazon.com/Silverware-SANTUO-Stainless-Restaurant-Dishwasher/dp/B0CXQ51N6Z/ref=sr_1_15_sspa?_encoding=UTF8&content-id=amzn1.sym.5d0c6367-faf2-4a6d-abef-5547b5a67981&crid=2LRTV3593NEHX&dib=eyJ2IjoiMSJ9.1CIlJUVJ9KjQGMgn2dTFxTV1cbKE1egsr0NRVPQVeyShJM7gD8xME7uMJdaptQwmINliNxrXJb3KaUg0lRdAj9Mp0Z_ab_P9VoJ_XiTpDKcfTlBPOgCUybZ-pAWX91HkZwTp3LjU-zI0wbGDa4iHnXmVKeHP4l34OUeNB64LmyaofYEM_YFDpZh5R21jmitUk5VQwKwxPaFrh6tzXP26ZJ571gfHKE0O_LZGm2cjQNNRTtuFWLQKLoraerXmv6JDXQR0sxyPRKzRUt81Csc5-ATGWxARMevH9N425ENuIC0.2Q8enSHFwzNM7HRviDXDAQYQHTD7rCUxmlxVatanUx8&dib_tag=se&keywords=Kitchen&pd_rd_r=2174133f-5167-4425-b06d-30315d8856cd&pd_rd_w=L5xEu&pd_rd_wg=xfOmB&qid=1752329702&s=kitchen-intl-ship&sprefix=kitchen%2Ckitchen-intl-ship%2C202&sr=1-15-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&th=1',
                'https://www.amazon.com/TrendPlain-16oz-Dispenser-Bottle-Kitchen/dp/B0CJF94M8J/ref=sr_1_22?_encoding=UTF8&content-id=amzn1.sym.5d0c6367-faf2-4a6d-abef-5547b5a67981&crid=2LRTV3593NEHX&dib=eyJ2IjoiMSJ9.1CIlJUVJ9KjQGMgn2dTFxTV1cbKE1egsr0NRVPQVeyShJM7gD8xME7uMJdaptQwmINliNxrXJb3KaUg0lRdAj9Mp0Z_ab_P9VoJ_XiTpDKcfTlBPOgCUybZ-pAWX91HkZwTp3LjU-zI0wbGDa4iHnXmVKeHP4l34OUeNB64LmyaofYEM_YFDpZh5R21jmitUk5VQwKwxPaFrh6tzXP26ZJ571gfHKE0O_LZGm2cjQNNRTtuFWLQKLoraerXmv6JDXQR0sxyPRKzRUt81Csc5-ATGWxARMevH9N425ENuIC0.2Q8enSHFwzNM7HRviDXDAQYQHTD7rCUxmlxVatanUx8&dib_tag=se&keywords=Kitchen&pd_rd_r=2174133f-5167-4425-b06d-30315d8856cd&pd_rd_w=L5xEu&pd_rd_wg=xfOmB&qid=1752329702&s=kitchen-intl-ship&sprefix=kitchen%2Ckitchen-intl-ship%2C202&sr=1-22&th=1',

                //'https://www.amazon.com/dp/PRODUCT_ID_2',
                // ... more links
            ];

            $results = [];
            foreach ($amazonLinks as $url) {
                $result = $this->storeStaticScrapedProducts($url);
                $results[] = $result;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Products scraped and stored successfully.',
            ]);
        }
    public function storeStaticScrapedProducts($url)

    {
        try {
           $nodePath = "/usr/bin/node"; // get this by running `which node` on your server

            // Build the full path to your Node script
            $scriptPath = base_path('scrapeNodejs/scrapeAmazon.js'); // adjust folder name here

            $escapedUrl = escapeshellarg($url);

            $command = "node {$scriptPath} {$escapedUrl}";


            Log::info("Running shell command: {$command}");

            $output = shell_exec($command);

            Log::info('Node Output:', ['output' => $output]);

            $result = json_decode($output, true);

            if (!$result) {
                throw new \Exception("Invalid scrape result.");
            }
            $description = isset($result['features']) && is_array($result['features'])
                ? implode("\n", $result['features'])
                : (is_string($result['features']) ? $result['features'] : null);
            $product = Product::create([
                'user_id'    => 1, // Or use auth()->id() if authentication is required
                'name'       => $result['title'],
                'description'=> $description,
                'price'      => $result['price'] ?? 0,
                'keywords'   => implode(',', $result['keywords'] ?? []),
                'url'        => $result['url'] ?? null
            ]);
            if (!empty($result['keywords'])) {
                foreach ($result['keywords'] as $categoryName) {
                    $category = Category::firstOrCreate(
                        ['name' => strtolower($categoryName)],
                        ['description' => null]
                    );
                    // Attach product to category (pivot table)
                    DB::table('product_categories')->updateOrInsert(
                        [
                            'product_id'  => $product->id,
                            'category_id' => $category->id
                        ],
                        [
                            'created_at' => now(),
                            'updated_at' => now()
                        ]
                    );
                }
            }
            if (!empty($result['reviews']) && !empty($result['individualRatings'])) {
                foreach ($result['reviews'] as $i => $review) {
                    $rating = $result['individualRatings'][$i] ?? null;
                    if ($rating !== null) {
                        AmazonReview::create([
                            'product_id' => $product->id,
                            'rating'     => (int)$rating,
                            'reviewer_name' => $result['reviewerNames'][$i] ?? null,
                            'comment'    => $review
                        ]);
                    }
                }
            }
            // Store images
            if (!empty($result['images'])) {
                foreach ($result['images'] as $img) {
                    AmazonImages::create([
                        'product_id' => $product->id,
                        'image_url'  => $img
                    ]);
                }
            }

            DB::commit();

            return;
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Scraping failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCategories(){
       $categoryNames = Category::pluck('name')->toArray();

        // Pick a random SuggestedCategorySet (IDs 1 to 5 assumed)
        $setId = rand(6, 10);
        $set = SuggestedCategorySet::find($setId);
        dd($set);
        // Use categories from the set if found and not empty
        if ($set && !empty($set->categories)) {
            $categoryNames = $set->categories;
        }


        // Fetch categories with related products and reviews
        $categories = Category::whereIn('name', $categoryNames)
            ->with([
            'products.amazonImages',
            'products.amazonReviews',
            'products.reviews'
            ])
            ->get();
        dd($categoryNames, $categories);

            $prompt = "Given the following list of product categories:\n\n" .
            implode(", ", $categoryNames) .
            "\n\nSelect 5 categories that are as **different** from each other as possible (avoid similar ones like 'home & kitchen' and 'kitchen & dining'). Return the result as a JSON array of category names.";

            try {
                $ollamaResponse = Http::timeout(120)
                    ->withOptions([
                        'connect_timeout' => 30,
                        'read_timeout' => 120,
                    ])
                    ->post('http://localhost:11434/api/generate', [
                        'model' => 'llama3.2',
                        'prompt' => $prompt,
                        'stream' => false,
                    ]);

                $responseData = json_decode($ollamaResponse->body(), true);


                if (!isset($responseData['results'][0]['text'])) {
                    return response()->json(['error' => 'Invalid response from Ollama'], 500);
                }

                $selectedCategoriesJson = $responseData['results'][0]['text'];
                $selectedCategories = json_decode($selectedCategoriesJson, true);

                if (!is_array($selectedCategories) || empty($selectedCategories)) {
                    return response()->json(['error' => 'Failed to parse categories'], 500);
                }
                return response()->json([
                    'status' => 'success',
                    'categories' => $selectedCategories
                ]);

            } catch (\Exception $e) {
                return response()->json(['error' => 'Failed to get categories from Ollama: ' . $e->getMessage()], 500);
            }
    }

}
