// Quand on appuie sur des boutons d'action dans la page 'Mes Quizzes'
function onClickMyQuizBtn(action, quiz_id = 0, qstn_id = 0) {
  // On change le contenu de la fenetre modale template
  modifyMyQuizModal(action, quiz_id, qstn_id);

  // On recupere l'element DOM de la fenetre modale
  let modal = document.querySelector(`#modal-template`);

  // On l'initialise et specifie la fonction
  // qui sera appellee juste apres la fermeture de la fenetre modale
  let instance = M.Modal.init(modal, {
    onCloseEnd: function() {
      // setTimeout(() => {
        console.log(`@modal.onCloseEnd()`);
        state.qstnContentTemp = undefined;
        state.propObjArr = undefined;
        state.props_ids = undefined;
      // }, 1000);
    }
  });

  // On ouvre la fenetre modale
  instance.open();
}

// Fonction pour ajouter des propositions
// (au moment de la creation de question dans la fenetre modale "Create Question")
function addPropQstnModal() {
  console.debug(`@addPropQstnModal()`);

  // console.log('@addPropQstnModal() => state.propObjArr BEFORE :');
  // console.log(state.propObjArr);

  // console.log('@addPropQstnModal() => state.props_ids BEFORE :');
  // console.log(state.props_ids);

  // On recupere ce qui etait saisi par l'utilisateur
  let prop = document.getElementById('add-qstn-modal-input-prop').value;

  // Si le contenu de la prop. est vide ou contient que des espaces
  if (prop === '' || !prop || !prop.replace(/\s/g, '').length) {
    M.toast({
      html: 'Proposition is empty !',
      displayLength: 4000,
      classes: 'error'
    });
  } else {
    // Sinon on ajoute la proposition dans l'objet temporaire
    // qui existe que dans le contexte de la fenetre modale actuelle
    // (et detruit apres la fermeture)

    // ID de la prop. a ajouter
    let prop_id = state.propObjArr.length;

    // On teste s'il y en a deja une avec cet ID
    while (state.props_ids.includes(prop_id)) {
      // Si OUI on icremente l'ID tant que la condition est fausse
      prop_id++;
    }

    // On cree l'objet
    let obj = {
      content: prop,
      proposition_id: prop_id,
      correct: false
    };

    // On l'insere dans l'objet temporaire
    // pour le conserver apres la mise a jour de la fenetre modale actuelle
    state.propObjArr.push(obj);
    state.props_ids.push(prop_id);

    // console.log('@addPropQstnModal() => state.propObjArr AFTER :');
    // console.log(state.propObjArr);

    // console.log('@addPropQstnModal() => state.props_ids AFTER :');
    // console.log(state.props_ids);

    // On sauvegarde le texte saisi dans le champs "Question"
    state.qstnContentTemp = document.getElementById('input-question').value;

    // On met a jour la fenetre modale actuelle
    modifyMyQuizModal(state.modalAction, state.myCurrentQuiz, state.modal_qstn_id);
  }
}

// Fonction pour supprimer des propositions
// (au moment de la creation de question dans la fenetre modale "Create Question")
function removePropQstnModal(prop_id) {
  console.debug(`@removePropQstnModal(${prop_id})`);

  state.propObjArr.map((prop, index) => {
    if (prop.proposition_id === prop_id) {
      state.propObjArr.splice(index, 1);
    }
  });
  // console.debug(`@removePropQstnModal(${prop_id}) => state.propObjArr :`);
  // console.debug(state.propObjArr);

  state.props_ids.map((id, index) => {
    if (id === prop_id) {
      state.props_ids.splice(index, 1);
    }
  });
  // console.debug(`@removePropQstnModal(${prop_id}) => state.props_ids :`);
  // console.debug(state.props_ids);

  state.qstnContentTemp = document.getElementById('input-question').value;
  modifyMyQuizModal(state.modalAction, state.myCurrentQuiz, state.modal_qstn_id);
}


// ======================================================================
// ============================== VUES ==================================
// ======================================================================

// Fonction qui modifie le contenu de la fenetre modale template
// pour chaque action => contenu different
function modifyMyQuizModal (action, quiz_id = 0, qstn_id = 0) {
  console.debug(`@modifyMyQuizModal('${action}', ${quiz_id}, ${qstn_id})`);

  // let modal_html = document.getElementById('modal-template');
  let modal_title = document.getElementById('modal-template-title');
  let modal_body = document.getElementById('modal-template-body');
  let modal_footer = document.querySelector('#modal-template .modal-footer');

  state.modalAction = action;
  state.modal_qstn_id = qstn_id;

  switch (action) {
    case 'add-question':

      modal_title.innerHTML = 'Add Question';

      // les variables temporaires qui seront supprimees
      // apres la fermeture de la fenetre modale.
      // On en a besoin pour garder les valeurs saisies
      // par l'utilisateur lors de chaque ajout ou suppression
      // des propositions.
      if (state.qstnContentTemp === undefined) {
        state.qstnContentTemp = '';
      }
      if (state.propObjArr === undefined) {
        state.propObjArr = [];
      }
      if (state.props_ids === undefined) {
        state.props_ids = [];
      }

      let html = `<div class="input-field">
        <input id="input-question" type="text" class="validate" value="${state.qstnContentTemp}">
        <label ${(state.propObjArr) ? 'class="active"' : ''} for="input-question">Question *</label>
      </div>
      <ul class="collection">`;
      state.propObjArr.map((prop, index) => {
        html += `<li class="collection-item question-proposition row add-qstn-modal-prop-block">
          <p class="col">${index+1}) ${prop.content}</p>
          <a class="myQuiz-remove-prop-btn valign-wrapper col right" onclick="removePropQstnModal(${prop.proposition_id})">
            <i class="material-icons">delete</i>
            Remove
          </a>
          <label class="col right">
            <input id="prop-id-${prop.proposition_id}" name="add-qstn-modal-prop-correct" type="radio" />
            <span>Correct</span>
          </label>
        </li>`;
      });
      html += `<li class="collection-item">
        <div class="row valign-wrapper add-qstn-modal-input-prop-block">
          <div class="input-field col">
            <input id="add-qstn-modal-input-prop" type="text" class="validate">
            <label for="add-qstn-modal-input-prop">Proposition</label>
          </div>
          <a class="add-qstn-modal-add-prop-btn valign-wrapper col right" onclick="addPropQstnModal()">
            <i class="material-icons">add</i>
            Add
          </a>
        </div>
      </li>`;
      html += `</ul>`;
      modal_body.innerHTML = html;

      modal_footer.innerHTML = `
      <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="postQuestion(${quiz_id})" id="modal-template-okBtn" class="waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;

    case 'edit-quiz':

      let quizToEditPromise = getOneQuiz(quiz_id);
      quizToEditPromise.then((quizToEdit) => {

        console.log(`quizToEdit :`);
        console.log(quizToEdit);

        modal_title.innerHTML = 'Edit Quiz';
        modal_body.innerHTML = `<div class="input-field">
          <input id="input-change-quiz-title" type="text" class="validate" value="${quizToEdit.title}">
          <label class="active" for="input-change-quiz-title">Title *</label>
        </div>
        <div class="input-field">
          <textarea id="input-change-quiz-description" class="materialize-textarea" data-length="120">${quizToEdit.description}</textarea>
          <label class="active" for="input-change-quiz-description">Description *</label>
        </div>
        <div class="switch">
          <label>
            Closed
            <input id="input-change-quiz-open" type="checkbox" value="open" ${(quizToEdit.open) ? 'checked' : ''}>
            <span class="lever"></span>
            Open
          </label>
        </div>`;
        modal_footer.innerHTML = `
        <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
        <a onclick="updateQuiz(${quiz_id})" id="modal-template-okBtn" class="waves-effect waves-green btn-flat cyan-text">OK</a>`;
      });

      break;

    case 'edit-question':

      modal_title.innerHTML = 'Edit Question';

      // console.log(`@modifyMyQuizModal('${action}', ${quiz_id}, ${qstn_id}) => state.propObjArr BEFORE`);
      // console.log(state.propObjArr);

      // Pour pre-remplir les champs du formulaire
      // (execute qu'une seule fois)
      if (state.qstnContentTemp === undefined &&
          state.propObjArr === undefined &&
          state.props_ids === undefined) {

        state.myQuestions.map((qstn) => {
          if(qstn.question_id === qstn_id) {

            state.qstnContentTemp = qstn.sentence;
            state.propObjArr = [];
            state.props_ids = [];

            // On copie toutes les propositions dans state.propObjArr
            // (on est oblige de faire comme ca, car si on fait
            // state.propObjArr = qstn.propositions
            // JS va faire une reference et c'est pas ce qu'on veut)
            qstn.propositions.map((prop, index) => {
              state.propObjArr[index] = {
                content: prop.content,
                proposition_id: prop.proposition_id,
                correct: false
              };
              // On copie les IDs
              state.props_ids.push(prop.proposition_id);
            });
          }
        });
      }

      // console.log(`@modifyMyQuizModal('${action}', ${quiz_id}, ${qstn_id}) => state.propObjArr AFTER`);
      // console.log(state.propObjArr);

      let htmlEditQstn = `<div class="input-field">
        <input id="input-question" type="text" class="validate" value="${state.qstnContentTemp}">
        <label ${(state.propObjArr) ? 'class="active"' : ''} for="input-question">Question *</label>
      </div>
      <ul class="collection">`;
      state.propObjArr.map((prop, index) => {
        htmlEditQstn += `<li class="collection-item question-proposition row add-qstn-modal-prop-block valign-wrapper">
          <div class="input-field col">
            <input id="prop-content-id-${prop.proposition_id}" type="text" class="validate" value="${prop.content}">
            <label class="active" for="prop-content-id-${prop.proposition_id}">${index+1} Proposition</label>
          </div>`;
        // htmlEditQstn += `<a class="myQuiz-remove-prop-btn valign-wrapper col right" onclick="removePropQstnModal(${prop.proposition_id})">
        //   <i class="material-icons">delete</i>
        //   Remove
        // </a>`;
        htmlEditQstn += `<label class="col right">
          <input id="prop-id-${prop.proposition_id}" name="add-qstn-modal-prop-correct" type="radio" />
          <span>Correct</span>
        </label>`;
        htmlEditQstn += `</li>`;
      });
      // htmlEditQstn += `<li class="collection-item">
      //   <div class="row valign-wrapper add-qstn-modal-input-prop-block">
      //     <div class="input-field col">
      //       <input id="add-qstn-modal-input-prop" type="text" class="validate">
      //       <label for="add-qstn-modal-input-prop">Proposition</label>
      //     </div>
      //     <a class="add-qstn-modal-add-prop-btn valign-wrapper col right" onclick="addPropQstnModal()">
      //       <i class="material-icons">add</i>
      //       Add
      //     </a>
      //   </div>
      // </li>`;
      htmlEditQstn += `</ul>`;
      modal_body.innerHTML = htmlEditQstn;

      modal_footer.innerHTML = `
      <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="updateQuestion(${quiz_id},${qstn_id})" id="modal-template-okBtn" class="waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;
  }
}