// Le bouton "Login" est appue
document.getElementById('login-submit').onclick = () => {
  // on recupere la cle 'xApiKey' saisie par l'utilisateur
  state.xApiKey = document.getElementById('login-key-input').value;
  // console.log(`@login => ${state.xApiKey}`);

  // on vide le champs de saisie
  document.getElementById('login-key-input').value = '';

  // on met 'xApiKey' dans les entetes
  headers.set('X-API-KEY', state.xApiKey);

  const url = `${state.serverUrl}/users/whoami`;

  // on envoie la requete 'GET user' au serveur
  fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      console.log('@login => Data : ');
      console.log(data);
      state.user = data;

      // S'il n'existe pas de l'utilisateur avec cet xApiKey
      if (state.user === undefined) {
        M.toast({
          html: 'Your X-Api-Key is not valid!',
          displayLength: 4000,
          classes: 'error'
        });
      }

      // Si l'utilisateur a 'logged in' sans problemes
      if (state.user) {
        // On ferme la fenetre modale actuelle
        let elem = document.querySelector('#modal-login');
        let instance = M.Modal.getInstance(elem);
        instance.close();

        // on change le contenu de la fenetre modale de bienvenue
        modifyWelcomeModalHtml();
        // on l'ouvre
        let elemWelcome = document.querySelector('#modal-welcome');
        let instanceWelcome = M.Modal.getInstance(elemWelcome);
        instanceWelcome.open();

        // on change le html
        signedIn();
      }
    }).then(() => {
      // Si tout est bien passe on recupere
      // les quizzes et les reponse de l'utilisateur
      if (state.user) {
        getMyQuizzes();
        getMyAnswers();
      }
    });
};

// Le bouton "Logout" est appue
document.getElementById('logout-submit').onclick = () => {
  // On supprime 'xApiKey' dans 'state'
  state.xApiKey = '';
  console.log(`logout => Deleting state.xApiKey`);

  // On supprime 'user' dans 'state'
  state.user = undefined;
  console.log(`logout => Deleting state.user`);

  // On supprime 'mes quizzes' et 'mes reponses'
  state.myQuizzes = undefined;
  state.myAnswers = undefined;

  // on change le html
  logedOut();
};


// ======================================================================
// ============================== VUES ==================================
// ======================================================================

// Fonction qui met le prenom et le nom de l'utilisateur
// dans la fenetre modale de bienvenue
const modifyWelcomeModalHtml = () => {
  let welcomeModal = document.getElementById('modal-welcome');
  welcomeModal.children[0].innerHTML = `
      <h4>Welcome, ${state.user.lastname} ${state.user.firstname} !</h4>
      <p>We are glad to see you !</p>
    `;
};

// Fonction qui sera appellee juste apres login
const signedIn = () => {
  // On affiche l'icone de profil de l'utilisateur
  let profileIcon = document.getElementById('id-login');
  profileIcon.style.display = 'inline-block';

  // On remplace le bouton "login" par "logout"
  let loginBtnBlock = document.getElementById('login-btn').parentNode;
  loginBtnBlock.innerHTML = `<a id="logout-btn" class="waves-effect waves-light btn cyan modal-trigger" href="#modal-logout">Logout</a>`;
};

// Fonction qui sera appellee juste apres logout
const logedOut = () => {
  // On cache l'icone de profil de l'utilisateur
  let profileIcon = document.getElementById('id-login');
  profileIcon.style.display = 'none';

  // On remplace le bouton "logout" par "login"
  let logoutBtnBlock = document.getElementById('logout-btn').parentNode;
  logoutBtnBlock.innerHTML = `<a id="login-btn" class="waves-effect waves-light btn cyan modal-trigger" href="#modal-login">Login</a>`;

  // On supprime le contenu des pages "mes quizzes", "mes reponses"
  document.getElementById('id-my-quizzes-list').innerHTML = `<h4>Login to see your quizzes</h4>`;
  document.getElementById('id-my-answers-list').innerHTML = `<h4>Login to see your answers</h4>`;
  document.getElementById('id-my-current-quiz').innerHTML = '';
  document.getElementById('id-my-answers-main').innerHTML = '';
};