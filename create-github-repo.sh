#!/bin/bash

# Script per creare il repository GitHub e fare il push
# Assicurati di avere un Personal Access Token GitHub configurato

echo "🚀 Creazione repository GitHub per Visual Gram Lab..."

# Nome del repository
REPO_NAME="visual-gram-lab"
USERNAME="alessandroperlangeli"

# Controlla se il repository esiste già
if curl -s "https://api.github.com/repos/$USERNAME/$REPO_NAME" | grep -q '"message": "Not Found"'; then
    echo "📦 Creazione nuovo repository..."
    
    # Crea il repository
    curl -X POST \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/user/repos \
        -d '{
            "name": "'$REPO_NAME'",
            "description": "📸 Instagram Preview App - Create and share Instagram content previews with drag & drop, advanced caption editor, and multi-view previews",
            "homepage": "https://github.com/'$USERNAME'/'$REPO_NAME'",
            "private": false,
            "has_issues": true,
            "has_projects": true,
            "has_wiki": true,
            "has_downloads": true,
            "auto_init": false
        }'
    
    echo ""
    echo "✅ Repository creato con successo!"
else
    echo "⚠️  Repository esiste già"
fi

# Aggiungi il remote origin
echo "🔗 Aggiunta remote origin..."
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git

# Push del codice
echo "📤 Push del codice su GitHub..."
git push -u origin main

echo "🎉 Completato! Repository disponibile su: https://github.com/$USERNAME/$REPO_NAME"
