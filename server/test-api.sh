#!/bin/bash
# Todo API テストスクリプト (Linux/Mac/Git Bash用)
# 実行: bash test-api.sh

BASE_URL="http://localhost:3001"

echo "=== Todo API テスト ==="
echo ""

# 1. ヘルスチェック
echo "1. ヘルスチェック"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if [ $? -eq 0 ]; then
    echo "✅ ヘルスチェック成功: $HEALTH_RESPONSE"
else
    echo "❌ ヘルスチェック失敗"
    exit 1
fi
echo ""

# 2. Todo作成
echo "2. Todo作成"
NEW_TODO_RESPONSE=$(curl -s -X POST "$BASE_URL/api/todos" \
    -H "Content-Type: application/json" \
    -d '{"text":"テストTodo 1"}')
TODO_ID=$(echo $NEW_TODO_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ -n "$TODO_ID" ]; then
    echo "✅ Todo作成成功: ID=$TODO_ID"
    echo "   $NEW_TODO_RESPONSE"
else
    echo "❌ Todo作成失敗"
    exit 1
fi
echo ""

# 3. 全Todo取得
echo "3. 全Todo取得"
TODOS_RESPONSE=$(curl -s "$BASE_URL/api/todos")
if [ $? -eq 0 ]; then
    COUNT=$(echo $TODOS_RESPONSE | grep -o '"id"' | wc -l)
    echo "✅ 全Todo取得成功: ${COUNT}件"
    echo "$TODOS_RESPONSE" | python -m json.tool 2>/dev/null || echo "$TODOS_RESPONSE"
else
    echo "❌ 全Todo取得失敗"
fi
echo ""

# 4. 単一Todo取得
echo "4. 単一Todo取得 (ID: $TODO_ID)"
TODO_RESPONSE=$(curl -s "$BASE_URL/api/todos/$TODO_ID")
if [ $? -eq 0 ]; then
    echo "✅ 単一Todo取得成功"
    echo "$TODO_RESPONSE" | python -m json.tool 2>/dev/null || echo "$TODO_RESPONSE"
else
    echo "❌ 単一Todo取得失敗"
fi
echo ""

# 5. Todo更新
echo "5. Todo更新 (ID: $TODO_ID)"
UPDATED_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/todos/$TODO_ID" \
    -H "Content-Type: application/json" \
    -d '{"completed":true}')
if [ $? -eq 0 ]; then
    echo "✅ Todo更新成功"
    echo "$UPDATED_RESPONSE" | python -m json.tool 2>/dev/null || echo "$UPDATED_RESPONSE"
else
    echo "❌ Todo更新失敗"
fi
echo ""

# 6. Todo削除
echo "6. Todo削除 (ID: $TODO_ID)"
DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/todos/$TODO_ID")
if [ "$DELETE_STATUS" = "204" ]; then
    echo "✅ Todo削除成功"
else
    echo "❌ Todo削除失敗 (HTTP Status: $DELETE_STATUS)"
fi
echo ""

# 7. 削除確認
echo "7. 削除確認（全Todo取得）"
FINAL_TODOS=$(curl -s "$BASE_URL/api/todos")
if [ $? -eq 0 ]; then
    FINAL_COUNT=$(echo $FINAL_TODOS | grep -o '"id"' | wc -l)
    echo "✅ 残りTodo数: ${FINAL_COUNT}件"
else
    echo "❌ 削除確認失敗"
fi
echo ""

echo "=== テスト完了 ==="

