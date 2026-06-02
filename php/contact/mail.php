<?php
/**
 * Sends portfolio contact email via PHP mail().
 */
function contact_send_mail(array $data): bool
{
    $config = require dirname(__DIR__) . '/config.php';
    $to = $config['recipient'];
    $subject = 'New Portfolio Message: ' . $data['subject'];
    $timestamp = date('Y-m-d H:i:s');

    $body = "--- New Contact Form Submission ---\r\n";
    $body .= "Timestamp: {$timestamp}\r\n\r\n";
    $body .= "Name: {$data['name']}\r\n";
    $body .= "Email: {$data['email']}\r\n";
    $body .= "Phone: {$data['phone']}\r\n";
    $body .= "Subject: {$data['subject']}\r\n\r\n";
    $body .= "Message:\r\n{$data['message']}\r\n";
    $body .= "-----------------------------------\r\n";

    $fromName = $config['from_name'];
    $fromAddress = $config['from_address'];
    $replyTo = $data['email'];

    $headers = "From: {$fromName} <{$fromAddress}>\r\n";
    $headers .= "Reply-To: {$replyTo}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    return mail($to, $subject, $body, $headers);
}
