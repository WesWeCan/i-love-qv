<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Voting Round Created</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        .section h2 {
            color: #13a89e;
            margin-top: 0;
        }
        .link {
            display: block;
            margin: 10px 0;
            word-break: break-all;
            color: #13a89e;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
        }
        .button {
            display: inline-block;
            background-color: #13a89e;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px 10px 0;
        }
        .button:hover {
            background-color: #16c9bd;
        }
        .qr-info {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>"{{ $election->name }}" has been created</h1>
    </div>

    <div class="section">
        <h2>Manage Link</h2>
        <p>Save this link to manage the election:</p>
        <p>On this page you can stop the voting round and release the results.</p>
        <a href="{{ $manageUrl }}" class="link">{{ $manageUrl }}</a>
        <a href="{{ $manageUrl }}" class="button">Manage election</a>
    </div>

    <div class="section">
        <p>Share the links below with the people that need to vote. QR codes are attached to this email.</p>
    </div>

    <div class="section">
        <h2>Voting Link</h2>
        <p>Share this link with voters:</p>
        <a href="{{ $votingUrl }}" class="link">{{ $votingUrl }}</a>
        <a href="{{ $votingUrl }}" class="button">Go to {{ $election->name }}</a>
        <div class="qr-info">QR Code: voting-{{ strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s-]/', '', $election->name))) }}.png (attached with cyan heart)</div>
    </div>

    <div class="section">
        <h2>Results Link</h2>
        <p>Share this link to view the results:</p>
        <a href="{{ $resultsUrl }}" class="link">{{ $resultsUrl }}</a>
        <a href="{{ $resultsUrl }}" class="button">See results</a>
        <div class="qr-info">QR Code: results-{{ strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s-]/', '', $election->name))) }}.png (attached with purple heart)</div>
    </div>

    
</body>
</html>
