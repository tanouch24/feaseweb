# Bootstrap du premier administrateur

Cette procédure ne met aucun mot de passe dans Git et ne crée aucun compte automatiquement.

1. Dans Supabase `Authentication → Users`, créer un utilisateur avec son email réel et un mot de passe fort, ou l'inviter selon la politique email choisie.
2. Récupérer uniquement son UUID depuis la fiche Auth — jamais son mot de passe.
3. Dans le SQL Editor du projet FeaseWeb, exécuter la requête suivante en remplaçant l'UUID validé :

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = '<AUTH_USER_UUID>';
```

4. Vérifier que la requête retourne une ligne et que l'email du profil correspond à l'utilisateur créé :

```sql
select id, email, role from public.profiles where id = '<AUTH_USER_UUID>';
```

5. Se connecter sur `/connexion`, vérifier la redirection `/admin`, puis vérifier qu'un utilisateur client est refusé par le serveur.

Pour révoquer les droits, remettre `role = 'client'` ou désactiver/supprimer l'utilisateur depuis Supabase Auth selon la procédure de conservation applicable. Le mot de passe est géré et stocké par Supabase Auth, jamais par FeaseWeb.
