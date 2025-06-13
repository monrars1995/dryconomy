<?php
// router.php (localizado na raiz do projeto: c:\Users\Usuario\Simulador\router.php)

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Verifica se a requisição é para a API
if (strpos($request_uri, '/api') === 0) {
    // Monta o caminho para o arquivo api.php dentro da pasta database
    $api_file = __DIR__ . '/database/api.php';

    if (file_exists($api_file)) {
        // Define o diretório de trabalho para a pasta 'database' ANTES de incluir o api.php
        // Isso garante que caminhos relativos dentro de api.php (como require_once __DIR__ . '/config.php') funcionem corretamente.
        chdir(__DIR__ . '/database');
        
        // Inclui o arquivo api.php para processar a requisição
        require $api_file;
        exit; // Termina a execução após o api.php lidar com a requisição
    } else {
        // Se o api.php não for encontrado, retorna 404
        http_response_code(404);
        echo json_encode(['error' => 'Entry point api.php not found in database folder.']);
        exit;
    }
}

// Para qualquer outra requisição (arquivos estáticos, etc.),
// deixa o servidor embutido do PHP lidar com ela.
// Se o arquivo solicitado existir na raiz do documento (definido por -t), ele será servido.
// Caso contrário, o servidor retornará 404.
if (is_file($_SERVER["DOCUMENT_ROOT"] . $request_uri)) {
    return false; // Serve o arquivo solicitado diretamente
}

// Se não for um arquivo e não for /api, pode ser uma rota do frontend (SPA)
// Nesse caso, sirva o index.html principal para que o roteamento do lado do cliente funcione.
// Verifique se o index.html existe na raiz do projeto ou na pasta 'dist' (comum em builds de SPAs)
if (file_exists($_SERVER["DOCUMENT_ROOT"] . '/index.html')) {
    readfile($_SERVER["DOCUMENT_ROOT"] . '/index.html');
    exit;
} elseif (file_exists($_SERVER["DOCUMENT_ROOT"] . '/dist/index.html')) { // Verifica na pasta dist
    readfile($_SERVER["DOCUMENT_ROOT"] . '/dist/index.html');
    exit;
}

// Se nada acima corresponder, retorna false para o servidor tentar encontrar o arquivo ou retornar 404.
return false;
?>