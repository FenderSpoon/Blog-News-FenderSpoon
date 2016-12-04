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

    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
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
    function loginUser() {
      alert("xfgdfgxfgxfb");
    }
    function showLoginView() {
        showView("viewLogin");
        $("#formLogin").trigger('reset');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    function listNews() {

    }
    function showCreateNewsView() {
        $('#formCreateNews').trigger('reset');
        showView('viewCreateNews');


    }
    function logoutUser() {

    }
    function registerUser() {
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

    }
    function editNews() {

    }
}

