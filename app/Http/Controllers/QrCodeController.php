<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


// docs: https://github.com/SimpleSoftwareIO/simple-qrcode/tree/develop/docs/en
class QrCodeController extends Controller
{
    public static function voting($uuid)
    {
        $qrCode = QrCode::size(300)

        ->margin(3)
        // ->backgroundColor(255, 255, 255, 0)
        // ->color(0, 0, 0)
        ->format('png')
        ->merge('/public/img/heart_cyan.png', 0.3)
        ->errorCorrection('H')
        ->generate(url('voting-round/' . $uuid));

        return response($qrCode)->header('Content-Type', 'image/png');
    }

    public static function results($uuid)
    {
        $qrCode = QrCode::size(300)
        ->margin(3)
        ->format('png')
        ->merge('/public/img/heart_gold.png', 0.3)
        ->errorCorrection('H')
        ->generate(url('results/' . $uuid));

        return response($qrCode)->header('Content-Type', 'image/png');
    }


    public static function manage($key)
    {
       
        $qrCode = QrCode::size(300)
        ->margin(3)
        ->format('png')
        ->merge('/public/img/heart_purple.png', 0.3)
        ->errorCorrection('H')
        ->generate(url('manage/' . $key));

        return response($qrCode)->header('Content-Type', 'image/png');

    }

}
