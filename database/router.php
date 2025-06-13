<?php
// router.php
$requested_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Se a requisição for para /api/*, encaminhe para api.php
// e defina $_GET['resource'] apropriadamente.
if (preg_match('#^/api/([^/]+)(?:/(.*))?$#', $requested_path, $matches)) {
    $_GET['resource'] = $matches[1];
    // Se houver um ID ou sub-recurso, ele estará em $matches[2]
    // Você pode precisar ajustar como o api.php espera o ID (ex: /api/resource/id)
    // Se o seu api.php já espera o ID como parte da query string ou no corpo do request, isso pode ser suficiente.
    
    // Adiciona o ID ao $_GET se existir, para que o api.php possa usá-lo
    if (isset($matches[2])) {
        // Supondo que o ID é o primeiro segmento após o recurso
        // Ex: /api/resource/uuid-goes-here/outro-segmento
        // Precisamos garantir que estamos pegando apenas o ID se houver mais segmentos.
        $path_parts = explode('/', $matches[2]);
        if (!empty($path_parts[0])) {
            $_GET['id'] = $path_parts[0];
        }
    }

    require 'api.php';
    return true; // Indica que o request foi tratado.
}

// Para qualquer outra coisa, deixe o servidor embutido tentar encontrar o arquivo.
// Se o arquivo não existir, ele retornará 404.
if (is_file($_SERVER['DOCUMENT_ROOT'] . $requested_path)) {
    return false; // Serve o arquivo solicitado como está.
}

// Se não for um arquivo e não corresponder à rota da API, retorne 404.
http_response_code(404);
echo "404 Not Found: The requested resource {$requested_path} was not found on this server.";
return true;
?>