<?php
/**
 * Script para preparar arquivos para deploy
 * 
 * Este script cria um arquivo ZIP com todos os arquivos necessários para o deploy
 */

// Definir o nome do arquivo ZIP
$zipFileName = 'dryconomy_deploy.zip';

// Criar um novo arquivo ZIP
$zip = new ZipArchive();
if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    die("Não foi possível criar o arquivo ZIP\n");
}

// Adicionar arquivos do frontend (pasta dist)
addDirectoryToZip($zip, 'dist', '');

// Adicionar arquivo .htaccess
if (file_exists('.htaccess')) {
    $zip->addFile('.htaccess', '.htaccess');
    echo "Adicionado: .htaccess\n";
}

// Adicionar pasta database
addDirectoryToZip($zip, 'database', 'database');

// Adicionar arquivo GUIA_DEPLOY.md
if (file_exists('GUIA_DEPLOY.md')) {
    $zip->addFile('GUIA_DEPLOY.md', 'GUIA_DEPLOY.md');
    echo "Adicionado: GUIA_DEPLOY.md\n";
}

// Fechar o arquivo ZIP
$zip->close();

echo "\nArquivo $zipFileName criado com sucesso!\n";
echo "Este arquivo contém todos os arquivos necessários para o deploy na hospedagem.\n";
echo "Siga as instruções no arquivo GUIA_DEPLOY.md para completar o processo de deploy.\n";

/**
 * Função para adicionar um diretório ao arquivo ZIP
 * 
 * @param ZipArchive $zip Objeto ZipArchive
 * @param string $dir Diretório a ser adicionado
 * @param string $zipDir Diretório dentro do ZIP
 */
function addDirectoryToZip($zip, $dir, $zipDir) {
    if (is_dir($dir)) {
        if ($handle = opendir($dir)) {
            while (($file = readdir($handle)) !== false) {
                if ($file != '.' && $file != '..') {
                    $filePath = $dir . '/' . $file;
                    $zipFilePath = $zipDir !== '' ? $zipDir . '/' . $file : $file;
                    
                    if (is_dir($filePath)) {
                        // Criar diretório no ZIP
                        $zip->addEmptyDir($zipFilePath);
                        // Adicionar conteúdo do diretório recursivamente
                        addDirectoryToZip($zip, $filePath, $zipFilePath);
                    } else {
                        // Adicionar arquivo
                        $zip->addFile($filePath, $zipFilePath);
                        echo "Adicionado: $zipFilePath\n";
                    }
                }
            }
            closedir($handle);
        }
    }
}