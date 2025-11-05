# Todo API テストスクリプト
# PowerShellで実行: .\test-api.ps1

$baseUrl = "http://localhost:3001"

Write-Host "=== Todo API テスト ===" -ForegroundColor Cyan
Write-Host ""

# 1. ヘルスチェック
Write-Host "1. ヘルスチェック" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health"
    Write-Host "OK ヘルスチェック成功: $($health | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "NG ヘルスチェック失敗: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Todo作成
Write-Host "2. Todo作成" -ForegroundColor Yellow
try {
    $newTodo = Invoke-RestMethod -Uri "$baseUrl/api/todos" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"text":"テストTodo 1"}'
    $todoId = $newTodo.id
    Write-Host "OK Todo作成成功: ID=$todoId" -ForegroundColor Green
    Write-Host "   $($newTodo | ConvertTo-Json -Compress)"
} catch {
    Write-Host "NG Todo作成失敗: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. 全Todo取得
Write-Host "3. 全Todo取得" -ForegroundColor Yellow
try {
    $todos = Invoke-RestMethod -Uri "$baseUrl/api/todos"
    Write-Host "OK 全Todo取得成功: $($todos.Count)件" -ForegroundColor Green
    $todos | ForEach-Object {
        Write-Host "   - ID: $($_.id), Text: $($_.text), Completed: $($_.completed)"
    }
} catch {
    Write-Host "NG 全Todo取得失敗: $_" -ForegroundColor Red
}
Write-Host ""

# 4. 単一Todo取得
Write-Host "4. 単一Todo取得 (ID: $todoId)" -ForegroundColor Yellow
try {
    $todo = Invoke-RestMethod -Uri "$baseUrl/api/todos/$todoId"
    Write-Host "OK 単一Todo取得成功" -ForegroundColor Green
    Write-Host "   $($todo | ConvertTo-Json -Compress)"
} catch {
    Write-Host "NG 単一Todo取得失敗: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Todo更新
Write-Host "5. Todo更新 (ID: $todoId)" -ForegroundColor Yellow
try {
    $updatedTodo = Invoke-RestMethod -Uri "$baseUrl/api/todos/$todoId" `
        -Method PUT `
        -ContentType "application/json" `
        -Body '{"completed":true}'
    Write-Host "OK Todo更新成功" -ForegroundColor Green
    Write-Host "   Completed: $($updatedTodo.completed)"
} catch {
    Write-Host "NG Todo更新失敗: $_" -ForegroundColor Red
}
Write-Host ""

# 6. Todo削除
Write-Host "6. Todo削除 (ID: $todoId)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/todos/$todoId" -Method DELETE
    Write-Host "OK Todo削除成功" -ForegroundColor Green
} catch {
    Write-Host "NG Todo削除失敗: $_" -ForegroundColor Red
}
Write-Host ""

# 7. 削除確認
Write-Host "7. 削除確認（全Todo取得）" -ForegroundColor Yellow
try {
    $todos = Invoke-RestMethod -Uri "$baseUrl/api/todos"
    Write-Host "OK 残りTodo数: $($todos.Count)件" -ForegroundColor Green
} catch {
    Write-Host "NG 削除確認失敗: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== テスト完了 ===" -ForegroundColor Cyan
