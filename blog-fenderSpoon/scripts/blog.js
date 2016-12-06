function startApp() {
    sessionStorage.clear(); // Clear user auth data
    showHideMenuLinks();
    showView('viewHome');
    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListNews").click(listNews);
    $("#linkCreateNews").click(showCreateNewsView);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit actions

    $("#formLogin").submit(loginUser);
    $("#formRegister").submit(registerUser);
    $("#buttonCreateNews").click(createNews);
    $("#buttonEditNews").click(editNews);



    // Bind the info / error boxes: hide on click
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_SyDVHNgQl";
    const kinveyAppSecret =
        "c4e4cab01de343d7a6d73fa78d3a7c29";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };

    function showHideMenuLinks() {

        $("#menu a").hide();
        if (sessionStorage.getItem('authToken')) {
            // We have logged in user
            $("#linkHome").show();
            $("#linkListNews").show();
            $("#linkCreateNews").show();
            $("#linkLogout").show();

        } else {
            // No logged in user
            $("#linkHome").show();
            $("#linkLogin").show();
            $("#linkRegister").show();


        }

    }
    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showHomeView() {
        showView('viewHome');

    }
    function loginUser(event) {
        event.preventDefault();
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: loginSuccess,
            error: handleAjaxError
        });

        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listNews();
            showInfo('Login successful.');
        }

          }
    function showLoginView() {
        showView("viewLogin");
        $("#formLogin").trigger('reset');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " +
            sessionStorage.getItem('authToken'),
        };

    }

    function listNews() {
        showView('viewNews');
        $('#news').empty();





        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/News",
            headers: getKinveyUserAuthHeaders(),
            success: loadNewsSuccess,
            error: handleAjaxError
        });

        function loadNewsSuccess(news) {
           let table = $(`
              <table>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
                 </table>`);

            for (let n of news){
                let tr = $('<tr>');
            displayTableRow(tr, n);
                $('#news').empty();
            tr.appendTo(table);
        }
            $("#news").append(table)
        }
        function displayTableRow(tr,n) {
            let links = [];
            if(n._acl.creator == sessionStorage.getItem("userId")){
            let deleteLink = $("<a href ='#'>[Delete]</a>")
            .click(function () {deleteNewsById(n._id)});
            let editLink = $("<a href ='#'>[Edit]</a>")
                .click(function () {loadNewsForEdit(n._id)});
            links.push(deleteLink);
            links.push(" ");
            links.push(editLink);
            }
            let readLink = $("<a href ='#'>[Read]</a>")
                .click(function () {loadNewsForRead(n._id)});
            links.push(" ");
            links.push(readLink);
            tr.append(
                $('<td>').text(n.title),
                $('<td>').text(n.author),
                $('<td>').text(n.description),
                $('<td>').append(links)
            );
        }
    }
      function deleteNewsById(nId) {
          $.ajax({
              method: "DELETE",
              url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/News/" + nId,
              headers: getKinveyUserAuthHeaders(),
              success: deleteNewsSuccess,
              error: handleAjaxError
          });
          function deleteNewsSuccess() {
              showInfo("News deleted");
              listNews();
          }
      }
    function showCreateNewsView() {
        $('#formCreateNews').trigger('reset');
        showView('viewCreateNews');



    }
    function logoutUser() {
        sessionStorage.clear();
        $('#LoggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }

    function registerUser(event) {
        event.preventDefault();
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: registerSuccess,
            error: handleAjaxError
        });

        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listNews();
            showInfo('User registration successful.');
        }


    }
     function saveAuthInSession(userInfo) {
         sessionStorage.setItem("username",userInfo.username);
         sessionStorage.setItem("authToken",userInfo._kmd.authtoken);
         sessionStorage.setItem("userId",userInfo._id);
         $("#LoggedInUser").text("Welcome, "+ userInfo.username);
         listNews();

     }
     function showInfo(message) {
         $('#infoBox').text(message);
         $('#infoBox').show();
         setTimeout(function() {
             $('#infoBox').fadeOut();
         }, 3000);

     }


    function handleAjaxError(response) {
         let errorMsq = JSON.stringify(response);
         if(response.readyState === 0)
             errorMsq = "Cannot connect due to network error";
         if(response.responseJSON &&
             response.responseJSON.description)
             errorMsq = response.responseJSON.description;
         showError(errorMsq);
    }
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }


    function createNews() {
        let newsData = {
            title: $('#formCreateNews input[name=title]').val(),
            author: $('#formCreateNews input[name=author]').val(),
            description: $('#formCreateNews textarea[name=descr]').val()

        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/News",
            headers: getKinveyUserAuthHeaders(),
            data:newsData,
            success: createNewsSuccess,
            error: handleAjaxError
        });
        function createNewsSuccess() {
            showInfo("News created");
            listNews();
        }
    }

    function editNews() {
        let newsData = {
            title: $('#formEditNews input[name=title]').val(),
            author: $('#formEditNews input[name=author]').val(),
            description: $('#formEditNews textarea[name=descr]').val()
        };
        $.ajax({
            method: "PUT",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/News/" +
            $('#formEditNews input[name=id]').val(),
            headers: getKinveyUserAuthHeaders(),
            data:newsData,
            success: editNewsSuccess,
            error: handleAjaxError
        });
        function editNewsSuccess() {
            listNews();
            showInfo("News edited");

        }
    }

    function loadNewsForEdit(nId) {
        $.ajax({
            method: "GET",
            url: kinveyBookUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/News/" +nId,
            headers: getKinveyUserAuthHeaders(),
            success: loadNewsForEditSuccess,
            error: handleAjaxError
        });
        function loadNewsForEditSuccess(nId) {
            $('#formEditNews input[name=id]').val(nId._id);
            $('#formEditNews input[name=title]').val(nId.title);
            $('#formEditNews input[name=author]').val(nId.author);
            $('#formEditNews textarea[name=descr]').val(nId.description);
            showView('viewEditNews');
        }
    }
    function loadNewsForRead(nId) {
        $.ajax({
            method: "GET",
            url: kinveyBookUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/News/" + nId,
            headers: getKinveyUserAuthHeaders(),
            success: loadNewsForReadSuccess,
            error: handleAjaxError
        });
        function loadNewsForReadSuccess(nId) {
            $('#formReadNews input[name=id]').val(nId);
            $('#formReadNews textarea[name=descr]')
                .val(nId.description);
            showView('viewReadNews');
        }
    }


    }

