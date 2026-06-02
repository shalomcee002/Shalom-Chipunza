<?php
/**
 * Validates contact form POST data.
 *
 * @return array{ok: bool, errors: string[], data: array<string, string>}
 */
function contact_validate_post(): array
{
    $name = trim((string) filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS));
    $email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
    $phone = trim((string) filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_SPECIAL_CHARS));
    $subject = trim((string) filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_SPECIAL_CHARS));
    $message = trim((string) filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS));

    $errors = [];

    if ($name === '' || strlen($name) < 3) {
        $errors[] = 'Name is too short.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email address.';
    }

    if ($phone === '') {
        $errors[] = 'Phone number is required.';
    }

    if ($message === '' || strlen($message) < 10) {
        $errors[] = 'Message is too short.';
    }

    if ($subject === '') {
        $errors[] = 'Please select a subject.';
    }

    return [
        'ok' => empty($errors),
        'errors' => $errors,
        'data' => [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'subject' => $subject,
            'message' => $message,
        ],
    ];
}
