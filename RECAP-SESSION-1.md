# Récapitulatif — Formation « construire un produit avec l'IA », session 1

- **Auteur** : Alexis Diligent
- **Date de la session** : 12 octobre 2026 (matin)
- **Outil utilisé** : Claude Code (l'IA code, teste et déploie ; Alexis cadre, vérifie et garde la main)
- **Sujet choisi** : un outil de gestion des réclamations clients pour une agence bancaire
- **Produit en ligne** : https://reclamations-agence.vercel.app
- **Dépôt du code** : https://github.com/alexisdiligent-art/reclamations-agence

---

## 1. Le cours en bref

### 1.1 Le principe

On construit **un seul produit**, qu'on fait grandir pendant cinq semaines, **sans lire ni écrire une ligne de code**. L'IA fait tout le travail technique. Le participant apprend à la piloter : dire ce qu'il veut, découper, vérifier en utilisant le produit, garder la main sur les versions, les clés et l'argent, et savoir expliquer avec des mots comment son produit est organisé.

Chaque vendredi : une démonstration de vingt minutes sur le produit en ligne, sans diapositives. Le groupe est le jury. Les données sont toujours fictives.

### 1.2 Les cinq semaines

| Semaine | Thème | Ce que le produit sait faire à la fin |
|---|---|---|
| 1 | Le socle | En ligne, avec comptes, deux rôles, écrans, base de données, règle métier, API externe, courriels, pièces jointes |
| 2 | La machine de nuit | Va chercher des données chaque nuit, les nettoie, envoie un récapitulatif le matin, est surveillé |
| 3 | L'intelligence | Lit un document et remplit les champs, classe, résume, répond à une question en citant ses sources |
| 4 | L'agent | Agit dans le produit sous contrôle, demande validation avant l'irréversible, se pilote depuis Claude (serveur MCP) |
| 5 | La reprise | Reprendre le produit d'un autre, le comprendre, corriger un bogue caché, puis finir le sien |

### 1.3 Les règles permanentes

1. On ne touche pas au code : on le fait produire.
2. Le produit est en ligne dès le premier soir, et il le reste.
3. Une demande à la fois, une fonctionnalité par branche, une prévisualisation par branche. On ne teste jamais sur la production.
4. Avant chaque génération, une version enregistrée (un commit) dont le message dit pourquoi.
5. Après chaque génération, l'IA raconte ce qu'elle a changé, en français, et on vérifie en utilisant le produit.
6. Aucun secret dans le dépôt, dans le navigateur ni dans le chat : les clés vivent chez l'hébergeur.
7. Aucune donnée de vraie personne.
8. Si l'IA tourne en rond (trois correctifs sans progrès), on s'arrête, on revient à la dernière version qui marchait, on redécoupe.
9. Chaque session se termine par un état de reprise : fait, reste, cassé.
10. Les liens du produit et du dépôt sont envoyés au formateur 48 heures avant chaque séance.

### 1.4 La boucle de travail

C'est la méthode à retenir, identique du premier au dernier jour :

1. Écrire ce qu'on veut en dix lignes, avec les cas limites et ce qui est hors périmètre.
2. Dessiner l'écran et ses quatre états : vide, chargement, données, erreur.
3. Demander à l'IA un plan en tranches vérifiables, et le corriger.
4. Une tranche à la fois, sur une branche, version enregistrée avant.
5. Chaque tranche apporte sa preuve : un test qui passe, ou un geste fait soi-même sur la prévisualisation.
6. Faire raconter à l'IA ce qu'elle a changé, et refuser ce qui dépasse la demande.
7. Fusionner, puis vérifier en production.
8. Laisser l'état de reprise.

### 1.5 La stack commune (tout en gratuit)

| Brique | Rôle, en mots simples |
|---|---|
| Next.js (TypeScript) | Le cadre dans lequel le site est écrit |
| GitHub | Le coffre où le code et toutes ses versions sont conservés |
| Vercel | L'hébergeur : il fabrique le site à chaque envoi de code et le met en ligne |
| Neon (Postgres) | La base de données, où vivent les comptes et les réclamations |
| Auth.js | La bibliothèque qui gère la connexion (jamais écrite à la main) |
| shadcn/ui | Les composants d'interface : boutons, cartes, tableaux |
| Resend | L'envoi de courriels |
| UptimeRobot | La sonde qui vérifie que le site répond |
| Sentry | Le suivi des erreurs |

---

## 2. Ce que j'ai fait pendant cette session

### 2.1 Le déroulé

| Étape | Ce qui a été fait | La preuve constatée |
|---|---|---|
| Plan | L'IA a proposé un plan en six tranches, chacune avec sa preuve. Je l'ai validé avant tout travail. | Plan relu et accepté |
| Projet | Création du projet Next.js avec shadcn/ui | La page s'affiche sur mon poste |
| Conventions | Fichier `AGENTS.md` : la fiche de la formation, puis mes décisions (sujet, rôles, stack) | Fichier relu |
| Mise en ligne | Dépôt GitHub créé, relié à Vercel | Mon adresse `.vercel.app` répond |
| Base et clés | Base Neon créée à Francfort ; clés saisies par moi dans Vercel | Les variables apparaissent, valeurs masquées |
| Connexion | Page de connexion avec Auth.js, table des utilisateurs avec leur rôle | Un courriel inconnu donne « Courriel ou mot de passe incorrect » : la base répond |
| Premier compte | Page d'installation qui crée le premier responsable, puis se ferme | « Connecté : Camille Martin (Responsable) », puis déconnexion |
| Cycle de vie | Décision des statuts, des droits par rôle et des règles métier | Décision écrite dans `AGENTS.md` |
| Tables | Trois tables métier : clients, réclamations, historique | La prévisualisation se déploie sans erreur |
| Jeu de données | 10 comptes, 30 clients, 50 réclamations fictives, rejouable | Les compteurs affichent 8, 14, 7, 6, 15, et 3 en retard |
| Liste | Écran des réclamations, filtrable, avec ses quatre états | 50 lignes ; 6 « à valider » ; 3 « en retard » |
| Services | Comptes Resend, UptimeRobot et Sentry créés | Clé Resend dans Vercel, sonde active, tableau de bord Sentry |
| Reprise | Fichier `REPRISE.md` : fait, reste, cassé | Fichier à jour dans le dépôt |

### 2.2 Les décisions métier que j'ai prises

**Les deux rôles** : conseiller (utilisateur courant) et responsable (administrateur).

**Le cycle de vie d'une réclamation** :

```
Nouvelle → En cours → À valider → Clôturée
              ↕            ↓
     En attente client   retour à « En cours » si le responsable refuse
```

**Qui a le droit de faire quoi** :

| Action | Conseiller | Responsable |
|---|---|---|
| Créer une réclamation | Oui | Oui |
| Voir les réclamations | Les siennes seulement | Toutes |
| Traiter, mettre en attente, proposer une réponse | Les siennes | Toutes |
| Valider ou refuser la clôture | Non | Oui |
| Réattribuer à un autre conseiller | Non | Oui |

**Les règles métier** :

- Chaque réclamation a une échéance de réponse deux mois après sa réception ; le produit signale les retards et les échéances proches. (Délai à confirmer.)
- Un conseiller ne clôture jamais seul : il faut la validation du responsable.

### 2.3 Comment le produit est organisé, avec des mots

- **L'interface** : les pages que l'on voit (connexion, accueil, liste des réclamations, administration).
- **Le serveur** : la partie invisible, chez Vercel, qui vérifie qui est connecté et quel est son rôle, puis interroge la base. C'est lui qui décide ce que chacun a le droit de voir, pas l'écran.
- **Les données** : quatre tables chez Neon.
  - `utilisateurs` : les comptes, avec leur rôle et un mot de passe illisible (haché).
  - `clients` : les clients fictifs de l'agence.
  - `reclamations` : l'objet principal, relié à un client et à un conseiller.
  - `historique` : une ligne à chaque changement de statut (qui, quand, quoi).
- **Les services externes** : GitHub (le code), Vercel (l'hébergement et les clés), Neon (la base), et bientôt Resend, UptimeRobot, Sentry.

**Ce qui se passe quand je me connecte** : le navigateur envoie mon courriel et mon mot de passe au serveur ; le serveur demande à la base si ce compte existe ; il compare le mot de passe avec la version hachée ; si tout concorde, il me remet un laissez-passer signé (la session) qui contient mon rôle.

---

## 3. Ce que j'ai appris

### 3.1 Les notions, en une phrase chacune

| Notion | Ce que c'est |
|---|---|
| Commit | Une photo du projet à un instant donné, avec un message qui dit pourquoi |
| Branche | Une copie de travail du projet, pour essayer une fonctionnalité sans toucher à la version en ligne |
| Fusion | Le moment où une branche vérifiée rejoint la version principale |
| Prévisualisation | Une version d'essai du site, fabriquée pour une branche, avec sa propre copie de la base |
| Production | La vraie version, celle de l'adresse publique |
| Variable d'environnement | Un réglage ou une clé rangé chez l'hébergeur, jamais dans le code |
| Secret | Une clé ou un mot de passe : on ne l'écrit ni dans le code, ni dans le dépôt, ni dans le chat |
| Migration | Une instruction qui fait évoluer la structure de la base (créer une table, par exemple), jouée à chaque déploiement |
| Hachage | La transformation d'un mot de passe en une empreinte illisible ; même l'administrateur ne peut pas le relire |
| Rôle vérifié côté serveur | Le droit est contrôlé par le serveur ; masquer un bouton à l'écran ne protège rien |
| Les quatre états d'un écran | Vide, chargement, données, erreur : un écran n'est fini que s'il les gère tous |
| Jeu de données rejouable | Des données fictives qu'on peut régénérer à l'identique sans rien doubler |
| État de reprise | La note de fin de session qui permet de repartir sans rien redemander |

### 3.2 Les gestes de pilotage qui ont compté

- **Exiger un plan avant tout travail**, avec une preuve constatable pour chaque tranche.
- **Dire oui tranche par tranche** : l'IA attend mon accord avant de passer à la suite.
- **Faire le geste de preuve moi-même** : taper des identifiants faux, créer le compte, cliquer sur le bouton. Un déploiement « vert » ne prouve pas que le produit fait ce qu'on attend.
- **Saisir les clés moi-même** dans Vercel, sans jamais les montrer à l'IA.
- **Décider le métier avant de coder** : les statuts et les droits sont mes décisions, pas celles de l'IA.
- **Faire dire à l'IA ce qu'elle n'a pas vérifié**, pas seulement ce qui marche.

### 3.3 Les incidents, et ce qu'ils m'ont appris

| Incident | Cause | Leçon |
|---|---|---|
| Deux projets Vercel pour un seul dépôt | Le dépôt a été importé deux fois ; les clés étaient dans l'un, l'adresse transmise dans l'autre | Vérifier dans quel projet on branche un service ; supprimer les doublons |
| Mauvaise région proposée pour la base | Le choix « Francfort » n'avait pas été retenu à l'écran précédent | Relire l'écran de confirmation avant de valider ce qui est irréversible |
| Option « Auth » de Neon activée par défaut | Proposée d'office par le service | Refuser ce qui fait double emploi avec la stack imposée |
| Compteurs restés à zéro après la génération | La page ne relisait pas la base après l'action | Un message de succès ne suffit pas : regarder le résultat réel |
| Deux déploiements en échec | GitHub a refusé de servir le code à Vercel (trop de demandes rapprochées) | Un échec n'est pas toujours un bogue ; la version précédente reste en ligne |
| Police d'affichage incorrecte | Un réglage mal posé par l'outil d'installation des composants | Regarder l'écran, pas seulement le compte rendu |
| La base d'essai n'est pas la vraie base | Chaque prévisualisation a sa copie | Ce qui est créé en prévisualisation est à refaire en production |

---

## 4. Où j'en suis

### 4.1 Par rapport à la semaine 1

| Exigence de la fiche | État |
|---|---|
| En ligne le premier soir, connexion comprise | Fait |
| Comptes et premier administrateur | Fait |
| Invitations par courriel, réinitialisation du mot de passe | À faire |
| Deux rôles vérifiés côté serveur | Commencé : en place, mais jamais essayé avec un conseiller |
| Objet principal et cycle de vie dessiné avant de coder | Fait (décision), transitions pas encore codées |
| Trois tables reliées, évoluant par migrations | Fait |
| Liste filtrable avec ses quatre états | Fait |
| Fiche de détail, formulaire validé | À faire |
| Règle métier testée (cas normal, vide, piégé) | Règle écrite, tests à faire |
| Jeu de données fictif rejouable | Fait |
| API externe | À faire |
| Courriel et pièces jointes | À faire (compte Resend prêt) |
| Tests à chaque envoi, journaux, revue de sécurité, README | À faire |

### 4.2 Ce qui reste fragile

- Aucun test automatique : toutes les vérifications ont été faites à la main.
- Les comptes fictifs ne peuvent pas se connecter ; seul le compte de démonstration entre dans le produit.
- Aucune limite sur le nombre de tentatives de connexion.
- Des vulnérabilités sont signalées dans les dépendances et n'ont pas été examinées.
- Sur un écran étroit, le tableau des réclamations déborde en largeur.

### 4.3 Les prochaines étapes

1. Prendre en compte le retour du formateur sur le produit.
2. La fiche de détail d'une réclamation, avec les changements de statut et l'historique.
3. Les tests automatiques, en commençant par la règle de l'échéance.
4. Les invitations, pour créer des comptes conseillers qui peuvent se connecter.
5. Puis : formulaire de création, API externe, pièces jointes, journaux, revue de sécurité, README.

---

## 5. À retenir

- Un produit en ligne dès le premier jour change la façon de travailler : chaque tranche se vérifie sur une vraie adresse.
- Mon rôle n'est pas de coder, mais de **décider, découper et vérifier**.
- La preuve, c'est le geste que je fais moi-même sur le produit, pas le compte rendu de l'IA.
- Les secrets ne quittent jamais l'hébergeur.
- Une session sans état de reprise est une session à moitié perdue.
