// Bouton "Terminer" est clickable ssi
// l'utilisateur a repondu a toutes les questions
function onClickProp() {
  console.log("@onClickProp()");
  setTimeout(() => {
    // Nombre des questions aux-quelles l'utilisateur a deja repondu
    // (dans le contexte de quizz actuel)
    let nb = 0;

    // On recupere le nombre des propositions cochees
    // (= nombre des questions repondues, car une suele bonne reponse par question,
    // donc les boutons radio) et on le stocke dans nb
    state.questions.map((qstn) => {
      nb += document.querySelectorAll(`input[type=radio]:checked.input-qstn-${qstn.question_id}`).length;
    });
    console.log("@onClickProp() => Answered Questions Number : " + nb);

    // Si le nombre des questions deja repondues = nombre total des questions
    if (nb === state.questions.length) {
      // Alors le bouton "Terminer" est clickable
      console.log("@onClickProp() => All Questions Answered! Now you can send your answers.");
      document.getElementById('quiz-done-btn').classList.remove("disabled");
    }
  }, 100);
}

// Fonction pour cacher les propositions a une question
// (executee quand on clicke sur un bouton avec l'icone de triangle
// a cote de chaque question)
function showHideProps(qstn_id) {
  document.querySelector(`#qstn-${qstn_id}-props`).classList.toggle('propositions-block-expanded');
  document.querySelector(`#qstn-${qstn_id}-props`).classList.toggle('propositions-block-collapsed');
}

// Fonction qui sera executee quand l'utisateur termine un quizz
function onClickTerminer() {
  console.log("@onClickTerminer()");

  // Tableau des ses reponses
  let propsArr = new Array;

  console.log("@onClickTerminer() => user : ");
  console.log(state.user);

  // Si l'utilisateur est 'logged in'
  if (state.user) {
    // Tableau pour stocker les reponses (promesses) du serveur
    let responsePromisesArr = new Array;
    
    // Pour chaque question, on a une seule bonne reponse
    // (c'etait indique nulle part, qu'il y a plusieurs reponses possibles par question,
    // donc moi je suis parti du fait que c'est nous qui choisissons)
    state.questions.map((qstn, index) => {
      // On stocke une proposition cochee pour chaque question
      propsArr[index] = Number(document.querySelector(`input[type=radio]:checked.input-qstn-${qstn.question_id}`).value);

      // les donnees a envoyer sur le serveur
      let jsonData = new Object({
        user_id: state.user.user_id,
        quiz_id: qstn.quiz_id,
        question_id: qstn.question_id,
        proposition_id: propsArr[index],
        answered_at: new Date()
      });

      console.log("@onClickTerminer() => Data to send : ");
      console.log(jsonData);

      // On envoie la requete au serveur et stocke la reponse du serveur
      responsePromisesArr[index] = postAnswers(jsonData.quiz_id, jsonData.question_id, jsonData.proposition_id);

      console.log("@onClickTerminer() => Promise Returned : ");
      console.log(responsePromisesArr[index]);
    });

    // Des que toutes les promesses sont resolues
    // (c-a-d quand toutes les reponses ont ete envoyees et enregistrees)
    Promise.all(responsePromisesArr).then((respArr) => {
      console.log("@onClickTerminer() => Response Array returned from the server : ");
      console.log(respArr);

      // On calcule le statut global de toute la requete
      // (ca marche si toutes les 'sous-requetes' ont le meme statut,
      // sinon la moyenne est calculee)
      let accumStatus = 0;
      respArr.map(r => accumStatus += r.status);
      accumStatus /= respArr.length;

      // Gestion des reponses selon le statut
      switch (accumStatus) {
        case 201:
          // SUCCESS
          M.toast({
            html: 'Answers Saved !',
            displayLength: 4000,
            classes: 'success'
          });
          break;
        case 403:
          // Quizz is CLOSED
          M.toast({
            html: 'This Quizz is closed !',
            displayLength: 4000,
            classes: 'error'
          });
          break;
      }

      // to update user's answers
      getMyAnswers();
    });
  }
  else {
    // Si l'utilisateur n'est pas 'logged in'
    M.toast({
      html: 'You have to login before !',
      displayLength: 4000,
      classes: 'error'
    });
  }
}