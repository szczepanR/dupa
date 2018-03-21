/**
 * Created by Sz on 2015-04-28.
 */


    //check repeats, display appriopraite message according to repeat value from database
function dailyorweekly(repeat){
    if (repeat == 1){
        return "codziennie"
    }else if(repeat == 7){
        return "co tydzień"
    }else{
        return "jednorazowo"
    }
}
//get resourcename from database
function getResourceName(resourceID){

    var resource = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin/process.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=getResourceName'+'&resourceID=' + resourceID,
        success: function (response) {
            resource = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystąpił następujący błąd przy pobraniu resourceName' + e.responseText);
        }

    });
    return resource.name;
}

function getResourceName2(){
    var resource =null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin/process.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=getResourceName2',
        success: function (response) {
            resource = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystapil nastepujacy blad przy pobraniu resourceName' + e.responseText);
        }
    });
    return resource;
}
function getResourceNameLocal(resourceArray, resourceID){
        for (i=0; i<resourceArray.length; i++){
            if (resourceArray[i].id == resourceID)
                return resourceArray[i].name;
        }
}
//calendar stuff
//calendar stuffvxcvxcvxcv
$(document).ready(function() {

    //store resources list to local array to avoid send query to database every time
    var resourcesArray = getResourceName2();
    /*****************************************************************************************************************
     *
     * Start the socket
     *
     ****************************************************************************************************************/
    //var user = login();
    var serverIP = '192.168.1.33';
    var serverPort = '3000';
    var socket = io.connect('http://' + serverIP + ':' + serverPort);
    var disconnectTime = 0;

    //execute connect when clinet is trying to connect
    socket.on('connect', function () {
        /*setup cookies to store username*/
        var username = Cookies.get('username');
        //console.log("usernameCookie="+username);
        if (username == undefined) {
            //clear value of username in top panel
            $('#usernameDiv').text("niezalogowany");
            $('#addUserModal').find('form')[0].reset();
            //show login window
            $('#addUserModal').modal('show');
            //focus on username input text box, need add some dleay due to fade in on modal window
            setTimeout(function () {
                $('#username').focus();
            }, 500);
            //make sure that login button is disabled
            $('#loginSubmitButton').prop('disabled', true);
            //enable login button when there is any character in input text box
            $('#addUserModal #username').keyup(function () {
                $('#loginSubmitButton').prop('disabled', this.value == "" ? true : false);
            });
        }
        else {
            socket.emit('adduser', username);
            $('#addUserModal').modal('hide');
            //console.log("wpisany user: "+username);
            //insert user name to top panel
            $('#usernameDiv').text(username);
            //insert user name to current user text box
            $('#actualUsername').val(username);
            //insert username to sending message modal
            $('#author').val(username);
        }


    });
    socket.on('user_exists', function (exists) {
        //console.log("wartosc exists "+exists);
        var check_if_exists = exists;

        if (check_if_exists) {
            //console.log("uzytkownik istnieje");

        }
        else {
            //console.log("wpisany user: "+username);
            $('#addUserModal').modal('hide');
        }
    });
    $('#loginSubmitButton').off('click');
    //click login button
    $('#loginSubmitButton').on('click', function () {
        socket.io.connect();
        //get value from input TODO: save username in cookies, but after validation.
        var username = $('#username').val();
        //try to add user to array in node.js TODO:create table in mysql to store users
        socket.emit('adduser', username);
        $('#addUserModal').modal('hide');
        //console.log("wpisany user: "+username);
        //insert user name to top panel
        $('#usernameDiv').text(username);
        //insert user name to current user text box
        $('#actualUsername').val(username);
        //insert username to sending message modal
        $('#author').val(username);
        //insert username in cookie
        Cookies.set('username', username, {expires: Infinity});
        /*socket.on('user_exists', function(exists){
         console.log("wartosc exists "+exists);
         check_if_exists = exists;

         if (check_if_exists)
         {
         console.log("uzytkownik istnieje");
         }
         else{
         console.log("wpisany user: "+username);
         $('#addUserModal').modal('hide');
         }
         });*/
    });
    //user button click
    $('#userButton').off('click');
    //user logout button
    $('#userButton').on('click', function () {
        $('#logoutReloginUserModal').modal('show');
    });
    //logout user
    $('#logoutSubmitButton').on('click', function () {
        var actualusername = $('#actualUsername').val();
        socket.emit('logout', actualusername);
        //close connection
        socket.io.close();
        Cookies.expire('username');
        $('#logoutReloginUserModal').modal('hide');
        socket.io.connect();
    });
    //try to reconnect when you disconnected(i.e. list wifi signal)
    socket.on('disconnect', function () {
        //toastr["error"]("Straciłeś połączenie z serwerem. Sprawdź połączenie z siecią bezprzewodową");
        //socket.io.connect();
        //$('#addUserModal').modal('show');
        return disconnectTime = moment().format('YYYY-MM-DD HH:mm:ss');

    });


    socket.on('reconnect', function () {

        //toastr["success"]("Wygląda na to, że połączenie wróciło. Sprawdź listę wiadomości i odswież plan");
        //TODO: prepare action after reconnecting i.e. info that you were disonnected and chek messages that you may missed
        //alert(disconnectTime+" czas rozłączenia")
        $.ajax({
            cache: false,
            type: "POST",
            datatype: "json",
            url: "admin/process.php",
            data: 'type=getInfoFromDb&disconnectTime=' + disconnectTime,
            success: function (data) {
                var change = jQuery.parseJSON(data);

                if (change.length != 0) {
                    ion.sound.play("Facebook");

                    for (var i in change) {

                        //toastr["info"](change[i].message);
                        if (change[i].message.indexOf('odwołano') != -1 || change[i].message.indexOf('Odwołano') != -1) {
                            toastr["error"](change[i].message);
                        }
                        else if (change[i].message.indexOf('Wiadomość') != -1) {
                            toastr["warning"](change[i].message);
                        }
                        else {
                            toastr["info"](change[i].message);
                        }

                    }
                    ;
                    $('#calendar').fullCalendar('refetchEvents');
                }
                ion.sound.destroy("Facebook");
            }

        });


    });
//load list of connected users when option is changed in dropdown
    socket.on('update', function (users) {
        $('#recipient').empty();
        var all = "wszyscy";
        // var allUserList = users;
        var userList = users.filter(function (item, index, inputArray) {
            return inputArray.indexOf(item) == index;
        });
        $('#recipient').append('<option value=' + all + '>' + all + '</select>');
        for (var i = 0; i < userList.length; i++) {
            $('#recipient').append('<option value=' + userList[i].userID + '>' + userList[i].userName + '</select>');
            //console.log("lista userów "+userList[i].userName);
        }
        $('#recipient').multiselect('rebuild');
    });
    socket.on('message', function (msg) {

        if (msg.indexOf('odwołano') != -1 || msg.indexOf('Odwołano') != -1) {
            toastr["error"](msg);
        }
        else if (msg.indexOf('Wiadomość od') != -1) {
            toastr["warning"](msg);
        }
        else {
            toastr["info"](msg);
        }

        $('#calendar').fullCalendar('refetchEvents');
        ion.sound.play("Facebook");

    });

    socket.on('privmessage', function (msg) {

        toastr["warning"](msg);

        ion.sound.play("Facebook");

    });

    socket.on('send', function (msg) {

    });

    /*****************************************************************************************************************
     *
     * message sending
     *
     ****************************************************************************************************************/
    $('#messagesButton').on('click', function () {

        $('#messageSubmitButton').prop('disabled', true);
        document.getElementById("messageContent").value = '';
        $('#messageModal').modal('show');
        $('#messageContent').keyup(function () {
            $('#messageSubmitButton').prop('disabled', this.value == "" ? true : false);
        });
    });
    $('#messageSubmitButton').on('click', function () {
        var sender = $('#author').val();
        var recipient = $('#recipient').val();
        var recipientname = $('#recipient option:selected').text();
        //console.log("recipientname "+recipientname);
        var messageContent = $('#messageContent').val();
        $('#recipient').multiselect('deselectAll');
        if (recipient == "wszyscy") {
            $('#messageModal').modal('hide');

            socket.send("Wiadomość do wszystkich od " + sender + ":  " + messageContent);
        } else {
            $('#messageModal').modal('hide');
            var msg = {
                author: sender,
                user: recipient,
                recipientname: recipientname,
                message: messageContent
            };
            socket.emit('privmessage', msg);
        }

    });
    //deselect all options when modal is hide
    $('#messageModal').on('hide.bs.modal', function () {
        $('#recipient').multiselect('deselectAll', false);
        $('#recipient').multiselect('updateButtonText');
    });
    /*****************************************************************************************************************
     *
     * message processing inside modal window
     *
     ****************************************************************************************************************/
    $('#messagesListButton').on('click', function () {

        $('#messagesEventModal').modal('show');
        var recipient = $('#actualUsername').val();
        var $table = $('#messagesTable');
        $table.bootstrapTable('refresh');
        $table.bootstrapTable({
            url: 'admin/messagesManage.php?recipient=' + recipient,
            columns: [{
                field: 'messageid',
                title: 'ID',
                sortable: false
            }, {
                field: 'timedate',
                title: 'Data utworzenia',
                sortable: true
            }, {
                field: 'sender',
                title: 'nadawca',
                sortable: false
            }, {
                field: 'recipient',
                title: 'odbiorca',
                sortable: false
            }, {
                field: 'message',
                title: 'wiadomość',
                sortable: false
            }]

        });

        $table.bootstrapTable('hideColumn', 'messageid');
    });
    /**********************************************************************************************************************
     * load resources with specific dates
     *
     *
     *********************************************************************************************************************/
    function loadResources() {
        var actualDate = moment().format('e');
        //var actualDate = $('#calendar').fullCalendar('getDate');
        if (actualDate != 0) {
            actualDate = actualDate - 1;
        }
        //console.log(actualDate);
        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                //we need to remove values from dropdown
                $("#selectResource").empty();
                $("#edit-resourceID").empty();
                $.each(data, function (i, resource) {

                    $("#selectResource").append('<option value="' + resource.id + '"selected="selected">' + resource.name + '</option>');
                    $("#edit-resourceID").append('<option value="' + resource.id + '"selected="selected">' + resource.name + '</option>');

                });
                $('#selectResource').multiselect('rebuild');
                $("#edit-resourceID").multiselect('rebuild');
                $.each(data, function (i, resource) {
                    if (resource.workingDays.indexOf(actualDate) === -1) {
                        $("#selectResource").multiselect('deselect', resource.id);
                    }
                    //console.log(resource.workingDays);
                });

            },
            error: function (data) {
                alert(data);
            }

        });
        element.fullCalendar('render', true);
    }

    /*******************************************************************************************************************
     * check that resources availaibility in a viewed day
     *
     *******************************************************************************************************************/
    function checkResources() {

        var actualDate = $('#calendar').fullCalendar('getDate');
        // console.log(actualDate);
        actualDate = actualDate.format('e');
        //console.log(actualDate);
        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {

                $.each(data, function (i, resource) {
                    if (resource.workingDays.indexOf(actualDate) === -1) {
                        $("#selectResource").multiselect('deselect', resource.id)

                    }
                    else {
                        $("#selectResource").multiselect('select', resource.id)

                    }

                    //console.log(resource.workingDays);
                });

                $('#calendar').fullCalendar('render', true);
            },
            error: function (data) {
                alert(data);
            }

        });

    }

    /*******************************************************************************************************************
     * need second function for load resources when refresh button is clicked,
     * this function have paramater with date freom calendar
     *
     *******************************************************************************************************************/

    function loadResources2(date) {

        var actualDate = moment(date).format('e');
        //var actualDate = $('#calendar').fullCalendar('getDate');

        //console.log(actualDate)
        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                //we need to remove values from dropdown
                $("#selectResource").empty()

                $.each(data, function (i, resource) {

                    $("#selectResource").append('<option value="' + resource.id + '"selected="selected">' + resource.name + '</option>');


                });

                $('#selectResource').multiselect('rebuild');

                $.each(data, function (i, resource) {
                    if (resource.workingDays.indexOf(actualDate) === -1) {
                        $("#selectResource").multiselect('deselect', resource.id)
                    }
                    //console.log(resource.workingDays);
                });

            },
            error: function (data) {
                alert(data);
            }

        });
        element.fullCalendar('render', true);
    }


    /*******************************************************************************************************************
     * call check resources on each day,
     * need to call click prev next button
     *
     ******************************************************************************************************************/

    $('body').on('click', 'button.fc-prev-button', function () {
        document.getElementById('loader').style.display = 'block';
        checkResources();


    });

    $('body').on('click', 'button.fc-next-button', function () {
        document.getElementById('loader').style.display = 'block';
        checkResources();


    });

//set options for notification window
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": 0,
        "extendedTimeOut": 0,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "tapToDismiss": true
    }
    //configure multiselect plugin for view dropdown
    $('#recipient').multiselect({

        enableFiltering: true,
        enableHTML: true,
        buttonClass: 'btn btn-white btn-primary',
        nonSelectedText: 'Wybierz odbiorcę',
        filterPlaceholder: 'Szukaj',
        templates: {
            button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
            ul: '<ul class="multiselect-container dropdown-menu"></ul>',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
            filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default btn-white btn-grey multiselect-clear-filter" type="button"><i class="fa fa-times-circle red2"></i></button></span>',
            li: '<li><a tabindex="0"><label></label></a></li>',
            divider: '<li class="multiselect-item divider"></li>',
            liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
        }

    });
    $('#edit-resourceID').multiselect({

        checkboxName: "myuniquename",//<--it fixes problem with multi select radio :)
        maxHeight: 300,
        enableFiltering: true,
        enableHTML: true,
        filterPlaceholder: 'Szukaj',
        buttonClass: 'btn btn-white btn-primary',
        templates: {
            button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
            ul: '<ul class="multiselect-container dropdown-menu"></ul>',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
            filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default btn-white btn-grey multiselect-clear-filter" type="button"><i class="fa fa-times-circle red2"></i></button></span>',
            li: '<li><a tabindex="0"><label></label></a></li>',
            divider: '<li class="multiselect-item divider"></li>',
            liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
        }

    });
    $('#eventType').multiselect({

        checkboxName: "myuniquename2",//<--it fixes problem with multi select radio :)
        maxHeight: 300,
        enableFiltering: false,
        enableHTML: true,
        buttonClass: 'btn btn-white btn-primary',
        templates: {
            button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
            ul: '<ul class="multiselect-container dropdown-menu"></ul>',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
            filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default btn-white btn-grey multiselect-clear-filter" type="button"><i class="fa fa-times-circle red2"></i></button></span>',
            li: '<li><a tabindex="0"><label></label></a></li>',
            divider: '<li class="multiselect-item divider"></li>',
            liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
        }

    });
//configure multiseletc plugin for resources dropdown
    $('#selectResource').multiselect({
        maxHeight: 500,
        buttonContainer: ' <a data-toggle="dropdown" class="dropdown-toggle" href="#"> ',
        allSelectedText: 'Wszyscy widoczni',
        selectAllText: 'Pokaż wszystkich',
        nSelectedText: 'widocznych',
        enableHTML: true,
        //buttonClass: 'btn btn-primary',
        buttonClass: '',
        templates: {
            button: '<li class="multiselect dropdown-toggle" data-toggle="dropdown"><i class="ace-icon fa fa-users" ></i>  <span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
            ul: '<ul class="multiselect-container dropdown-menu"></ul>',
            li: '<li><a tabindex="0"><label></label></a></li>',
            divider: '<li class="multiselect-item divider"></li>',
            liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
        }
    });

    //click event for exporting calendar to excell, not working
    $('#exportButton').on('click', function () {
        // $('#calendar').fullCalendar('destroy');
        location.reload();
    })

    //timepicker in modals for setting start and end of events
    $('.date').datetimepicker({
        // format: 'LT',
        locale: 'pl',
        format: 'HH:mm',
        stepping: '15',
        showClose: true,
        ignoreReadonly: true

    });

    //configure sounds
    ion.sound({
        sounds: [
            {name: "Facebook"}
        ],

        path: "sounds/",
        preload: true,
        multiplay: false,
        volume: 1
    });


    //for resources filtering
    $('#selectResource').change(function () {

        element.fullCalendar('render', true);


    });
    $('#selectResource').load(function () {

        element.fullCalendar('render', true);

    });
    //click date to go to the specific date, we use datepicker  and here specify initial values
    $('#customDateButton').off('click')
    $('#customDateButton').on('click', function (e) {

        var customDate = 0;
        $('#customDateButton').datepicker({
            weekStart: 1,
            todayHighlight: true,
            language: "pl",
            daysOfWeekDisabled: "0,6",
            autoclose: true,
            format: "yyyy-mm-dd"


        });
        $('#customDateButton').datepicker('show');
        $("#customDateButton").off("changeDate");
        $("#customDateButton").on("changeDate", function (event) {

            customDate = $("#customDateButton").datepicker('getFormattedDate')
            // console.log(customDate);
            $('#calendar').fullCalendar('gotoDate', customDate);
            checkResources();

        });
    });
    /**********************for checking value checkboxes begin**************************/

    function getRadioVal(form, name) {
        var val;
        // get list of radio buttons with specified name
        var radios = form.elements[name];

        // loop through list of radio buttons
        for (var i = 0, len = radios.length; i < len; i++) {
            if (radios[i].checked) { // radio checked?
                val = radios[i].value; // if so, hold its value in val
                break; // and break out of for loop
            }
        }
        return val; // return value of checked radio or undefined if none checked
    }

    /**********************for checking value checkboxes end**************************/

//remove action for mouse right click
//$('#calendar:not(".fc-event")').on('contextmenu', function (e) {
//
//    e.preventDefault()
//});
    var element = $('#calendar');

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    //detect mobile device
    var isWebkit = 'WebkitAppearance' in document.documentElement.style;


    loadResources();

    //need add timeout because fullcalendar is loaded befor resources and this look bad
    setTimeout(function () {
        element.fullCalendar({

            //height: 'auto',
            //contentHeight:600,
            //aspectRatio: '2.3',//<--this is for display 1600x900
            //aspectRatio: '1.3', //<--this is for display 1270x720
            //aspectRatio: '2.6', //<--this is for display 1024x600
            aspectRatio: '2.35',//<--this is for display galaxy tab 10
            loading: function (bool) {

                //$('#floatBarsG').show();
                //document.getElementById('loader').style.display = 'block';
            },
            header: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            lang: 'pl',
            defaultView: 'resourceDay',
            //defaultView:'agendaWeek',
            editable: true,
            droppable: true,
            selectable: true,
            selectHelper: true,
            minTime: "08:00:00",
            maxTime: "18:00:00",
            displayEventEnd: true,
            weekends: false,
            allDaySlot: false,
            allDayText: "urlop",
            eventTextColor: "black",
            unselectCancel: '.modal-dialog',
            lazyFetching: true,
            firstDay: 1,

            //define resource source
            resources: "admin/json-resources.php",

            //define events source
            events: {
                url: "admin/json-events.php",
                type: 'POST'

            },


            //resources filtering taken from github churchdesk/fullcalendar, star
            resourceFilter: function (resource) {

                var select1 = document.getElementById("selectResource");
                var selected1 = [];
                for (var i = 0; i < select1.length; i++) {
                    if (select1.options[i].selected) selected1.push(select1.options[i].value);
                }

                return $.inArray(resource.id, selected1) > -1;
            },

            /******************************************************************************************************************
             * attemt to sort resources by sortID
             *
             *
             ******************************************************************************************************************/
            resourceSort: function SortByDescendingName(a, b) {
                var aName = parseInt(a.sortID);
                var bName = parseInt(b.sortID);
                return ((aName > bName) ? 1 : ((aName < bName) ? -1 : 0));
            },

            eventAfterAllRender: function (view) {
                //
                //if (document.getElementById('bigScreenCalendar').checked == true) {
                //      $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
                //      //experimental, change row height
                //      $('#calendar').find('.fc-slats td').css({"height": "3.2em"});
                //      $(window).resize();
                //      //console.log('checked')
                //  }
                //  else {
                //
                //      $('#calendar').find('.fc-slats td').css({"height": "2.5em"});
                //
                //      $(window).resize();
                //  }
                //  if($('fc-content').is(':visible')) {
                //      alert("visible");
                //  }

            },

            //resources filtering taken from github churchdesk/fullcalendar, end
            viewRender: function (view, element) {

                /*//click date to go to the specific date, we use datepicker  and here specify initial values
                 this code here gives reload checkresources multi times!!!!!
                 $('#customDateButton').off('click')
                 $('#customDateButton').on('click', function (e) {

                 var customDate = 0;
                 $('#customDateButton').datepicker({
                 weekStart: 1,
                 todayHighlight: true,
                 language: "pl",
                 daysOfWeekDisabled: "0,6",
                 autoclose: true,
                 format: "yyyy-mm-dd"


                 });
                 $('#customDateButton').datepicker('show');
                 $("#customDateButton").off("changeDate");
                 $("#customDateButton").on("changeDate", function (event) {

                 customDate = $("#customDateButton").datepicker('getFormattedDate')
                 // console.log(customDate);
                 $('#calendar').fullCalendar('gotoDate', customDate);
                 checkResources();

                 });
                 });*/
                //click refresh view button
                $('#selectView-refresh').off('click');
                $('#selectView-refresh').on('click', function () {
                    location.reload();
                    //var date = $('#calendar').fullCalendar('getDate');
                    //loadResources2(date)
                    //$('#calendar').fullCalendar('refetchEvents');

                });

                //click print button
                $('#printButton').off('click')
                $('#printButton').on('click', function () {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        BootstrapDialog.alert({
                            title: 'Uwaga',
                            message: 'funkcja druku nie jest wspierana na urzadzeniach mobilnych, wydrukuj to na kompie :)',
                            type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Default value is false
                            draggable: true, // <-- Default value is false
                            buttonLabel: 'Zamknij' // <-- Default value is 'OK',
                        });

                    }
                    else {
                        // after clicking height need to be adjusted to lanscape paper
                        $('#calendar').fullCalendar('option', 'height', 'auto');
                        //need to decrese row height to squize time from 8 to 17 on a4 paper
                        element.find('.fc-slats td').css({"height": "2.3em"});

                        //allows to see new values
                        $(window).resize();

                        //need to put print window into function otherwise view cannot change so quick, set timeout provide some delay
                        setTimeout(function () {
                            window.print();
                        }, 1000);

                        //got from stackoverflow to refresh calendar after printing, don't know  what are variables here but works
                        //but only in Chrome :(
                        if (window.matchMedia) {
                            var mediaQueryList = window.matchMedia('print');
                            mediaQueryList.addListener(function (mql) {
                                if (!mql.matches) {

                                    //need to remove option height to set aspect Ratio, clever :)
                                    $('#calendar').fullCalendar('option', 'height', '');
                                    if (document.getElementById('bigScreenCalendar').checked == true) {
                                        $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
                                        $('#calendar').find('.fc-slats td').css({"height": "3.2em"});
                                    }
                                    else {
                                        //set aspect ratio
                                        element.fullCalendar('option', 'aspectRatio', 2.35);
                                        //set row height
                                        element.find('.fc-slats td').css({"height": "2.5em"});
                                    }
                                }
                            });
                        }
                    }

                });

            },

            //action when click on calendar to add new event
            // start
            //TODO: enable change date from form, maybe date picker?, how to display resource name rather than resource id
            select: function (start, end, jsEvent, view, resources) {


                $('#seletctEventTypeModal').modal('show');
                // BootstrapDialog.show({
                //    type: BootstrapDialog.TYPE_DANGER,
                //     closable: false,
                //title: 'Uwaga',
                //       message: 'Wybierz odpowiednią opcję',

                //       buttons: [{
                //           label: 'Nowe zajęcia',
                //          cssClass: 'btn-success',
                //         action: function (dialogItself) {
                //set color for typical lesson
                $('#lesson-button').on('click', function (e) {
                    var category = 1;
                    //dialogItself.close();
                    //reset form to the clear values
                    $('#createEventModal').find('form')[0].reset();
                    //human read start end and day

                    var starttime = $.fullCalendar.moment(start).format('HH:mm');
                    var endtime = $.fullCalendar.moment(end).format('HH:mm');
                    var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                    var resourcename = getResourceNameLocal(resourcesArray, resources);//getResourceName(resources);
                    var resourceID = resources;
                    $('#createEventModal #event-date').val(eventdate);
                    $('#createEventModal #start-time').val(starttime);
                    $('#createEventModal #end-time').val(endtime);
                    $('#createEventModal #resourceID').val(resourcename);
                    $('#seletctEventTypeModal').modal('hide');
                    $('#createEventModal').modal('show');

                    // assign function to onclick property of checkbox
                    //default we don't wanna see repeat-freq options
                    document.getElementById('repeatFreqDiv').style.display = 'none';
                    //now if we click repeats we schould see hidden options
                    document.getElementById('repeats').onclick = function () {
                        // access properties using this keyword
                        if (this.checked) {
                            document.getElementById('repeatFreqDiv').style.display = 'block';
                        } else {
                            //if repeats not checked we reset values and hide
                            $('input[name="repeat-freq"]').prop('checked', false);
                            document.getElementById('repeatFreqDiv').style.display = 'none';
                        }


                    };

                    //simple validation for title, just diable submit button if title is empty
                    $('#submitButton').prop('disabled', true);
                    $('#createEventModal #title').keyup(function () {
                        $('#submitButton').prop('disabled', this.value == "" ? true : false);
                    });


                    //fix for looping when add second third etc.. event
                    $('#submitButton').off('click')
                    //now when click submit on form
                    $('#submitButton').on('click', function (e) {
                        console.log("click submit button from sleect callback");
                        //we need title to print it on notification
                        var title = $('#createEventModal #title').val();
                        //there is problem with pass to php starttime and endtime from form,
                        //need to walkaround , so manually pass these two values to the PHP
                        var starttime2 = $('#createEventModal #start-time').val();
                        var endtime2 = $('#createEventModal #end-time').val();

                        //compare dates to check if range is corrcet
                        if (!(moment(starttime2, 'HH:mm').isBefore(moment(endtime2, 'HH:mm')))) {
                            alert("nie no bez jaj, ustaw poprawnie czas rozpoczecia i zakoczenia zajeć")

                            e.preventDefault();
                        }
                        //if dates are correct do this
                        else {

                            $("#createEventModal").modal('hide');
                            // enh. add category for overhours
                            //check if checkbox is checked
                            if (document.getElementById('overhours').checked == true) {

                                category = 5;
                            }
                            //just before sending the form we switching resource name to resource ID
                            $('#createEventModal #resourceID').val(resourceID);
                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin/add-event.php",
                                data: $('#createAppointmentForm').serialize() + "&category_id=" + category + "&start-time=" + starttime2 + "&end-time=" + endtime2,
                                success: function () {

                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(resourcename + " dodano nowe zajęcia dla " + title + " w dniu " + eventdate + " o godz " + starttime);
                                }
                            });
                        }
                    });
                }),//click lesson-button end
                    $('#study-button').on('click', function (e) {

                        //}//button nowe zajęcia
                        //   , {
                        //   label: 'Nowe badanie',
                        //   cssClass: 'btn-success',
                        //   action: function (dialogItself) {
                        //set color for study
                        var category = 2;

                        //dialogItself.close();
                        //reset form to the clear values
                        $('#createStudyModal').find('form')[0].reset();
                        //human read start end and day

                        var starttime = $.fullCalendar.moment(start).format('HH:mm');
                        var endtime = $.fullCalendar.moment(end).format('HH:mm');
                        var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var resourcename = getResourceNameLocal(resourcesArray, resources);//getResourceName(resources);
                        var resourceID = resources;
                        var mywhen = starttime + ' - ' + endtime + ' dnia: ' + eventdate + ' dla: ' + resourceID;
                        $('#createStudyModal #studyDate').val(eventdate);
                        $('#createStudyModal #studyStartTime').val(starttime);
                        $('#createStudyModal #studyEndTime').val(endtime);
                        $('#createStudyModal #studyResourceID').val(resourcename);
                        //$('#createStudyModal #studyDescription').val(event.description);
                        $('#seletctEventTypeModal').modal('hide');
                        $('#createStudyModal').modal('show');

                        //fix for looping when add second third etc.. event
                        $('#study-submitButton').off('click')

                        //now when click submit on form
                        $('#study-submitButton').on('click', function (e) {
                            //we need title to print it on notification
                            var title = $('#createStudyModal #studyTitle').val();
                            // We don't want this to act as a link so cancel the link action
                            $("#createStudyModal").modal('hide');
                            //just before sending the form we switching resource name to resource ID
                            $('#createStudyModal #studyResourceID').val(resourceID);
                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin/add-study.php",
                                data: $('#createStudyForm').serialize() + "&category_id=" + category,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(resourcename + " dodano nowe badanie dla " + title + " w dniu " + eventdate + " o godz " + starttime);
                                }
                            });
                        });
                    }),//end click study-button
                    // }, {
                    //    label: 'Przerwa',
                    //    cssClass: 'btn-success',
                    //    action: function (dialogItself) {
                    $('#break-button').on('click', function (e) {
                        //set color for break
                        var category = 3;

                        //dialogItself.close();
                        //reset form to the clear values
                        $('#createBreakModal').find('form')[0].reset();
                        //human read start end and day

                        var starttime = $.fullCalendar.moment(start).format('HH:mm');
                        var endtime = $.fullCalendar.moment(end).format('HH:mm');
                        var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var resourcename = getResourceNameLocal(resourcesArray, resources);//getResourceName(resources);
                        var resourceID = resources;
                        var mywhen = starttime + ' - ' + endtime + ' dnia: ' + eventdate + ' dla: ' + resourceID;
                        $('#createBreakModal #breakDate').val(eventdate);
                        $('#createBreakModal #breakStartTime').val(starttime);
                        $('#createBreakModal #breakEndTime').val(endtime);
                        $('#createBreakModal #breakResourceID').val(resourcename);
                        $('#seletctEventTypeModal').modal('hide');
                        $('#createBreakModal').modal('show');


                        //default we don't wanna see repeat-freq options
                        document.getElementById('breakRepeatFreqDiv').style.display = 'none';
                        //now if we click repeats we schould see hidden options
                        document.getElementById('breakRepeats').onclick = function () {
                            // access properties using this keyword
                            if (this.checked) {
                                document.getElementById('breakRepeatFreqDiv').style.display = 'block';
                            } else {
                                //if repeats not checked we reset values and hide
                                $('input[name="breakRepeatFreq"]').prop('checked', false);
                                document.getElementById('repeatFreqDiv').style.display = 'none';
                            }


                        };

                        //fix for looping when add second third etc.. event
                        $('#break-submitButton').off('click')

                        //now when click submit on form
                        $('#break-submitButton').on('click', function (e) {
                            var start2 = $('#createBreakModal #breakStartTime').val();
                            var end2 = $('#createBreakModal #breakEndTime').val();
                            if (!(moment(start2, 'HH:mm').isBefore(moment(end2, 'HH:mm')))) {
                                alert("nie no bez jaj, ustaw poprawnie czas rozpoczecia i zakoczenia zajeć")

                                e.preventDefault();
                            }
                            else {
                                // We don't want this to act as a link so cancel the link action
                                $("#createBreakModal").modal('hide');
                                //just before sending the form we switching resource name to resource ID
                                $('#createBreakModal #breakResourceID').val(resourceID);

                                console.log(end2);
                                e.preventDefault();
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    url: "admin/add-break.php",
                                    data: $('#BreakAppointmentForm').serialize() + "&category_id=" + category + "&breakStartTime=" + start2 + "&breakEndTime=" + end2,
                                    success: function () {
                                        //alert();
                                        $('#calendar').fullCalendar('unselect');
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename + " masz nową przerwę dniu " + eventdate + " w godz od" + start2 + " do " + end2);
                                    }

                                });
                            }

                        });


                    }),// en break-button
                    //}, {
                    //    label: 'Urlop',
                    //   cssClass: 'btn-warning',
                    //    action: function (dialogItself) {
                    //        dialogItself.close();
                    $('#vacation-button').on('click', function (e) {
                        //this will give different color for event leave
                        var category = 4;

                        //stuff for form
                        $('#createLeaveModal').find('form')[0].reset();
                        //default we create event for all day
                        var leavestarttime = moment().set({'hour': 08, 'minute': 00, 'second': 00}).format('HH:mm');
                        var leaveendtime = moment().set({'hour': 18, 'minute': 00, 'second': 00}).format('HH:mm');
                        var leaveeventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var leaveTitle = $('#createLeaveModal #leaveTitle').val();
                        var leaveresourcename = getResourceNameLocal(resourcesArray, resources);//getResourceName(resources);
                        var leaveresourceID = resources;
                        //put values to the form

                        $('#createLeaveModal #leaveDate').val(leaveeventdate);
                        $('#createLeaveModal #leaveStartTime').val(leavestarttime);
                        $('#createLeaveModal #leaveEndTime').val(leaveendtime);
                        $('#createLeaveModal #leaveResourceID').val(leaveresourcename);
                        $('#seletctEventTypeModal').modal('hide');
                        $('#createLeaveModal').modal('show');

                        //fix for looping when add second third etc.. event
                        $('#leaveSubmitButton').off('click')
                        //now when click submit on form
                        $('#leaveSubmitButton').on('click', function (e) {

                            //leave modal form does not work with form serialize, so to have speed up things, decided to put each value manually
                            var leavestarttime2 = $('#createLeaveModal #leaveStartTime').val();
                            var leaveendtime2 = $('#createLeaveModal #leaveEndTime').val();
                            var leaveTitle = $('#createLeaveModal #leaveTitle').val();

                            // We don't want this to act as a link so cancel the link action
                            $("#createLeaveModal").modal('hide');

                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin/add-leave.php",
                                data: "leaveTitle=" + leaveTitle + "&leaveDate=" + leaveeventdate + "&leaveStartTime=" + leavestarttime2 + "&leaveEndTime=" + leaveendtime2 + "&leaveResourceID=" + leaveresourceID + "&category_id=" + category,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(leaveresourcename + " nieobecność w dniu " + leaveeventdate);

                                }
                            });
                        });
                    })//end vataction-button
                //},
                //this is labelled as cancel
                //  {
                //   label: 'Anuluj',
                //   action: function (dialogItself) {
                //       dialogItself.close()
                //       $('#calendar').fullCalendar('unselect');

                //  }
                //}
                // ]
                // });//e/nd bootstrap dialog
                //added cancel class to the "cancel buutons in any modals to unselect uncreated event"
                // $('.cancel').off('click')
                //now when click cancel on form
                $('.cancel').on('click', function (e) {

                    $('#calendar').fullCalendar('unselect');

                });


            },

            //prepare action when event has been clicked
            eventClick: function (event, jsEvent, view, resources) {
                //human readable values inside modal form, so we changing format
                var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
                var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
                var eventdate = $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
                var resourcename = getResourceNameLocal(resourcesArray, event.resources);//getResourceName(event.resources);
                var resourceID = event.resources;
                var category_id = event.category_id;

                //below variables need go to the query to check if there is repeat for this event,
                var event_id = event.id;
                var parent_id = event.parent_id;
                var repeat_freq = event.repeat_freq;
                var title = event.title;
                var checkrepeats = dailyorweekly(repeat_freq);
                /*crete popover*/
                $('#preview-getPhoneNumberButton').popover({
                    container: 'body',
                    placement: 'bottom',
                    content: "brak numeru"
                });

                /************************
                 * find next resource name for kid
                 *
                 *
                 *
                 * ***********************/

                    //$('#preview-getNextResurceButton').off('click');
                   // $("#preview-getNextResurceButton").click(function (){
                      var popovertext = '';
                      var popovertext2 = '';
                        var events = $('#calendar').fullCalendar('clientEvents', function (event) {
                            //get list of events for displayed day
                            if (event.title == title && moment(event.start).format('YYYY-MM-DD') == eventdate && moment(event.start).format('HH:mm') > starttime)  {
                                return true;
                            }
                        });
                        //we need first occurence from return true
                        if(events[0]==undefined){
                            popovertext = 'Nie ma dziś więcej zajęć';

                        }else{
                            if (events[0].category_id==6){
                                popovertext = 'Następne zajęcia z: ' + getResourceNameLocal(resourcesArray, events[0].resources)+"<font color='red'> odwołane!!!</font>";
                                for(i = 1; i < events.length; i++)
                                {
                                    console.log(events[i].category_id);

                                    if(events[i].category_id==1|| events[i].category_id==2){
                                        popovertext2 = 'Następne zajęcia z: ' + getResourceNameLocal(resourcesArray, events[i].resources);
                                        break;
                                    }

                                };


                            }else{
                                popovertext = 'Następne zajęcia z: ' + getResourceNameLocal(resourcesArray, events[0].resources);

                            }

                        }
                    // });

                        //console.log(events[0].resources);
                        //console.log(getResourceNameLocal(resourcesArray, events[0].resources));
                        $('#preview-getNextResurceButton').popover({
                            placement: 'bottom',
                            container:'body',
                            html:true,
                            content: popovertext+"<br> "+popovertext2,
                        });


                $('#edit-submitButton').prop('disabled', false);
                $('#delete-submitButton').prop('disabled', false);
                //distinction between break and normal lesson
                //this if is for break
                if (title == 'PRZERWA') {
                    $('#previewBreakModal #previewBreakTitle').val(event.title);
                    $('#previewBreakModal #previewBreakDate').val(eventdate);
                    $('#previewBreakModal #previewBreakStartTime').val(starttime);
                    $('#previewBreakModal #previewBreakEndTime').val(endtime);
                    $('#previewBreakModal #previewBreakResourceID').val(resourcename);
                    $('#previewBreakModal').modal('show');
                    //fix for looping when add second third etc.. event

                    $('#deleteBreakSubmitButton').off('click');

                    // if "delete button clicked on prewiev modal"
                    $('#deleteBreakSubmitButton').on('click', function () {
                        // console.log(repeat_freq);
                        $('#previewBreakModal').modal('hide');

                        //set default value for radio button, and it is single break delete
                        $('input[id="deleteBreakSingle"]').prop('checked', true);
                        //select visibility of elements. Need to be reproduced on another values!!!!!!!!!!!!!
                        if (repeat_freq == 0) {
                            document.getElementById('divAllBreak').style.display = 'none';

                        }
                        else {
                            document.getElementById('divAllBreak').style.display = 'block';
                        }
                        $("label[for='checkRepeatsLabel']").html("<strong>" + checkrepeats + "</strong>");
                        $('#deleteBreakeModal').modal('show');

                        //fix for looping when add second third etc.. event
                        $('#deleteBreakConfirmSubmitButton').off('click');

                        // if "delete button clicked on prewiev modal"
                        $('#deleteBreakConfirmSubmitButton').on('click', function () {

                            var deleteOption = getRadioVal(document.getElementById('deleteBreak'), 'deleteBreakOption');
                            // console.log(repeat_freq);
                            //console.log(deleteOption);


                            if (repeat_freq == 0) {
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename + " Usunięto Twoją przerwę w dniu " + eventdate + " o godzinie " + starttime);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else if (repeat_freq != 0 && deleteOption == 'deleteBreakSingle') {
                                //console.log(deleteOption);
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-child-event&event_id=' + event_id,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename + " Usunięto Twoją przerwę w dniu " + eventdate + " o godzinie " + starttime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })

                            }
                            else if (repeat_freq != 0 && deleteOption == 'deleteAllBreak') {
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename + " Usunięto Twoją przerwę w dniu " + eventdate + " o godzinie " + starttime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                        })
                    })
                }
                else {

                    //put values to modal
                    $('#previewEventModal #preview-title').val(event.title);
                    $('#previewEventModal #preview-event-date').val(eventdate);
                    $('#previewEventModal #preview-start-time').val(starttime);
                    $('#previewEventModal #preview-end-time').val(endtime);
                    $('#previewEventModal #preview-resourceID').val(resourcename);
                    $('#previewEventModal #preview-description').val(event.description);
                    //check if overhours checked or not
                    if (event.category_id == 5) {

                        $('input[name="previewOverhours"]').prop('checked', true);
                    }
                    else {

                        $('input[name="previewOverhours"]').prop('checked', false);
                    }
                    //check if event has been cancelled,
                    //if yes then need hide cancel event button, but we need show button to cancel cancel button
                    if (event.category_id == 6) {

                        document.getElementById('cancelCancelSubmitButton').style.display = 'inline-block';
                        document.getElementById('AdditionalEventSubmitButton').style.display = 'inline-block';
                        document.getElementById('cancelSubmitButton').style.display = 'none';
                        document.getElementById('edit-submitButton').style.display = 'none';

                    }
                    //if not cancelled then we can simply enable this button
                    else {
                        document.getElementById('edit-submitButton').style.display = 'inline-block';
                        document.getElementById('cancelCancelSubmitButton').style.display = 'none';
                        document.getElementById('AdditionalEventSubmitButton').style.display = 'none';
                        document.getElementById('cancelSubmitButton').style.display = 'inline-block';

                    }
                    //we also don't want to see cancel button nor cancel cancel when leave or break is current event
                    if (event.category_id == 3 || event.category_id == 4) {
                        document.getElementById('AdditionalEventSubmitButton').style.display = 'none';
                        document.getElementById('cancelCancelSubmitButton').style.display = 'none';
                        document.getElementById('cancelSubmitButton').style.display = 'none';


                    }

                    document.getElementById('previewDescriptionButtons').style.display = 'none';
                    $('#preview-description').prop("readonly", true);
                    $('#previewEventModal').modal('show');

                    /*****************************************description processing begin*************************************************/
                    $('#previewEventModal #preview-description').focus(function (e) {

                        e.preventDefault();
                        $('#preview-description').prop("readonly", false);
                        $('#edit-submitButton').prop('disabled', true);
                        $('#delete-submitButton').prop('disabled', true);
                        document.getElementById('previewDescriptionButtons').style.display = 'block';
                        //$('#previewEventModal').focus();
                        $('#previewEventModal').css('margin-top', -300);
                    });

                    $('#previewDescriptionButtonOK').off('click');
                    $('#previewDescriptionButtonOK').on('click', function () {
                        var description2json = $("#preview-description").val();
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin/process.php",
                            data: 'type=updateDescription&event_id=' + event_id + '&description=' + description2json,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send(resourcename + " dodano opis do zajęć dla " + event.title + " w dniu " + eventdate + " o godz " + starttime);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy dodawaniu opisu' + e.responseText);
                            }
                        })

                        $('#preview-description').prop("readonly", true);
                        document.getElementById('previewDescriptionButtons').style.display = 'none';
                        $('#edit-submitButton').prop('disabled', false);
                        $('#delete-submitButton').prop('disabled', false);
                        $('#previewEventModal').css('margin-top', 0);
                    });

                    $('#previewDescriptionButtonCancel').off('click');
                    $('#previewDescriptionButtonCancel').on('click', function () {
                        $('#previewEventModal #preview-description').val(event.description);
                        $('#preview-description').prop("readonly", true);
                        document.getElementById('previewDescriptionButtons').style.display = 'none';
                        $('#edit-submitButton').prop('disabled', false);
                        $('#delete-submitButton').prop('disabled', false);
                        $('#previewEventModal').css('margin-top', 0);

                    });
                    //reset margin to original value when modal is closed
                    $('#previewEventModal').on('hidden.bs.modal', function (e) {
                        $('#preview-getPhoneNumberButton').popover('destroy');
                        $('#preview-getNextResurceButton').popover('destroy');
                        $('#previewEventModal').css('margin-top', 0);
                    });

                    /*****************************************description processing end*************************************************/

                        //fix for looping when add second third etc.. event
                    $('#delete-submitButton').off('click');

                    // if "delete button clicked on prewiev modal"
                    $('#delete-submitButton').on('click', function () {

                        $('#previewEventModal').modal('hide');
                        //if there is a single event only
                        if (repeat_freq == 0) {

                            $('#deleteSingleEventModal').modal('show');

                            //problem:: sometime checkbox for deletion all events from day does not work, it deletes only single event
                            //fix: set default value
                            $('input[id="deleteChildEvent"]').prop('checked', true);
                            //fix for looping when add second third etc.. event
                            $('#deleteSingle-submitButton').off('click');

                            // if "delete button clicked" on sigle event deletion
                            $('#deleteSingle-submitButton').on('click', function () {

                                //variable to hold radio buttons values with options for deleting events
                                var deleteOption = getRadioVal(document.getElementById('deleteNoRepeats'), 'optionsRadio');

                                if (deleteOption == 'deleteSingle') {
                                    $('#deleteSingleEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                        success: function (response) {
                                            socket.send(resourcename + ". Usunięto zajęcia dla " + event.title + " o godzinie " + starttime);
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                                else if (deleteOption == 'DeleteAllFromDay') {
                                    $('#deleteSingleEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-events-from-day&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&repeat_freq=' + repeat_freq,
                                        success: function (response) {
                                            //console.log(response.status);
                                            socket.send("Usunięto wszystkie zajęcia dla " + event.title + " w dniu " + eventdate);
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                            })
                        }
                        //if there is repeation
                        else if (repeat_freq != 0) {
                            //get value of repeats
                            var checkrepeats = dailyorweekly(repeat_freq);
                            //put retrieved repeats value to label on form
                            $("label[for='checkRepeatsLabel']").html("<strong>" + checkrepeats + "</strong>");

                            $('#deleteRepeateEventModal').modal('show');
                            //problem:: sometime checkbox for deletion all events from day does not work, it deletes only single event
                            //fix: set default value
                            $('input[id="deleteChildEventRepeate"]').prop('checked', true);

                            //fix for looping when add second third etc.. event
                            $('#deleteRepeate-submitButton').off('click');

                            // if "delete button clicked" on sigle event deletion
                            $('#deleteRepeate-submitButton').on('click', function () {


                                var deleteOptionRepeat = getRadioVal(document.getElementById('deleteYesRepeats'), 'optionsRadioRepeate');
                                //console.log(deleteOptionRepeat);
                                if (deleteOptionRepeat == 'deleteSingleRepeate') {
                                    //console.log(deleteOptionRepeat);
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-child-event&event_id=' + event_id,
                                        success: function (response) {
                                            socket.send(resourcename + ". Usunięto zajęcia dla " + event.title + " o godzinie " + starttime);
                                            $('#calendar').fullCalendar('refetchEvents');

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                                else if (deleteOptionRepeat == 'DeleteAllFromDayRepeate') {
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-events-from-day&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&repeat_freq=' + repeat_freq,
                                        success: function (response) {
                                            socket.send("Usunięto wszystkie zajęcia dla " + event.title + " w dniu " + eventdate);
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })

                                }
                                else if (deleteOptionRepeat == 'DeleteAllRepeate') {
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id + '&event_date=' + eventdate,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            socket.send("Usunięto wszystkie zajęcia dla " + event.title + " do końca roku");

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })

                                }

                            });

                        }


                    });

                    var editStartTime = $.fullCalendar.moment(event.start).format('HH:mm');
                    var editEndTime = $.fullCalendar.moment(event.end).format('HH:mm');
                    //modify button clicked
                    //fix for looping when add second third etc.. event
                    $('#edit-submitButton').off('click');
                    $('#edit-submitButton').on('click', function () {

                        $('#previewEventModal').modal('hide');
                        //put values to modal
                        $('#editEventModal #edit-title').val(event.title);
                        $('#editEventModal #edit-event-date').val(eventdate);
                        $('#editEventModal #edit-start-time').val(starttime);
                        $('#editEventModal #edit-end-time').val(endtime);
                        //$('#editEventModal #edit-resourceID').val(resourcename);
                        //assign value to current resourceID
                        $('#edit-resourceID').multiselect('select', event.resources);
                        $('#editEventModal #edit-description').val(event.description);

                        var event_id = event.id;
                        var parent_id = event.parent_id;
                        var repeat_freq = event.repeat_freq;

                        var category_id = event.category_id;

                        var old_edit_title = $('#editEventModal #edit-title').val(event.title);

                        //check if this event is overtime
                        if (event.category_id == 5) {

                            $('input[name="editOverhours"]').prop('checked', true);
                        }
                        else {

                            $('input[name="editOverhours"]').prop('checked', false);
                        }

                        //check if event is canelled or leave , if yes we should remove edit overtime,
                        if (event.category_id == 6) {
                            $('#editOverhours').prop('disabled', true);
                            $('#edit-confirm-submitButton').prop('disabled', true);
                            $('#editEventModal #edit-title').off('change');
                            $('#editEventModal #edit-title').change(function () {
                                $('#edit-confirm-submitButton').prop('disabled', false);
                                $('#editOverhours').prop('disabled', false);
                            });
                        }
                        else {
                            $('#editOverhours').prop('disabled', false);
                            $('#edit-confirm-submitButton').prop('disabled', false);
                        }

                        $('#editEventModal').modal('show');

                    });
                    // todo:not working need to provide switching enable disable button when start/end time is changed
                    //but now change event is not fired don't know why


                    //$('#editEventModal #edit-end-time').off('change');
                    //$('#editEventModal #edit-end-time').change(function(){
                    //   $('#edit-confirm-submitButton').prop('disabled', false);

                    //});
                    //todo: check if start time is not smaller that end time

                    $('#edit-confirm-submitButton').off('click');
                    $('#edit-confirm-submitButton').on('click', function (e) {

                        editStartTime = $('#editEventModal #edit-start-time').val();
                        editEndTime = $('#editEventModal #edit-end-time').val();
                        var newResourceID = $('#edit-resourceID option:selected').val();
                        //console.log(newResourceID);

                        $('#editEventModal').modal('hide');


                        //just before sending the form we switching resource name to resource ID
                        $('#editEventModal #edit-resourceID').val(resourceID);
                        e.preventDefault();

                        //if this edited event is converted from cancelled event, we modify only this event
                        if (category_id == 6) {
                            //check if overhours checkededitOverhours
                            if (document.getElementById('editOverhours').checked == true) {

                                category_id = 5;
                            }
                            else {
                                category_id = 1;
                            }
                            var editDescription = ''
                            $.ajax({
                                cache: false,
                                type: "POST",
                                datatype: "json",
                                url: "admin/update-event.php",
                                data: $('#editAppointmentForm').serialize() + '&type=cancel-event' + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&description=' + editDescription,
                                success: function (response) {
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(resourcename + " zmodyfikowano zajęcia dla " + event.title + " w dniu " + eventdate + " o godzinie " + starttime);

                                },
                                error: function (e) {
                                    alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                }
                            });

                        }
                        else {
                            //check if overhours checkededitOverhours
                            if (document.getElementById('editOverhours').checked == true) {

                                category_id = 5;
                            }
                            else {
                                category_id = 1;
                            }

                            //if there is a single event only
                            if (repeat_freq == 0) {
                                BootstrapDialog.confirm({
                                    type: BootstrapDialog.TYPE_DANGER,
                                    closable: false,
                                    title: 'Uwaga',
                                    message: 'Czy napewno zmodyfikować zajęcia?',
                                    btnCancelLabel: 'Anuluj',
                                    btnOKLabel: 'OK',
                                    btnOKClass: 'btn-danger',
                                    callback: function (result) {

                                        if (result == true) {
                                            //$('#editEventModal').modal('hide');
                                            $.ajax({
                                                cache: false,
                                                type: "POST",
                                                datatype: "json",
                                                url: "admin/update-event.php",
                                                data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                                success: function (response) {
                                                    //$('#calendar').fullCalendar('refetchEvents');
                                                    //TODO: refetch does not work inside, why??
                                                    $('#calendar').fullCalendar('refetchEvents');
                                                    socket.send(resourcename + " zmodyfikowano zajęcia dla " + event.title + " w dniu " + eventdate + " o godzinie " + starttime);
                                                },
                                                error: function (e) {
                                                    alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                                }
                                            })
                                        }
                                        else {
                                            //no need so far
                                            //dialogRef.close();
                                        }
                                    }
                                })
                            }
                            //if there is repeation
                            else if (repeat_freq != 0) {
                                var checkrepeats = dailyorweekly(repeat_freq);

                                BootstrapDialog.show({
                                    type: BootstrapDialog.TYPE_DANGER,
                                    closable: false,
                                    title: 'Uwaga',
                                    message: 'Te zajęcia odbywają się ' + checkrepeats + ". Wybierz odpowienią opcję",

                                    buttons: [{
                                        label: 'Zmień tylko te',
                                        cssClass: 'btn-success',
                                        action: function (dialogItself) {
                                            $.ajax({
                                                cache: false,
                                                type: "POST",
                                                datatype: "json",
                                                url: "admin/update-event.php",
                                                //here is something wrong with description
                                                data: $('#editAppointmentForm').serialize() + '&type=update-child-event' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                                success: function (response) {
                                                    $('#calendar').fullCalendar('refetchEvents');
                                                    socket.send(resourcename + " zmodyfikowano zajęcia dla " + event.title + " w dniu " + eventdate + " o godzinie " + starttime);

                                                },
                                                error: function (e) {
                                                    alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                                }
                                            });
                                            dialogItself.close();
                                        }

                                    }, {
                                        label: 'Zmień wszystkie',
                                        cssClass: 'btn-primary',
                                        action: function (dialogItself) {
                                            $.ajax({
                                                cache: false,
                                                type: "POST",
                                                datatype: "json",
                                                url: "admin/update-event.php",
                                                data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq=' + repeat_freq + '&edit-start-time='
                                                + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id + '&event-start-date=' + eventdate,
                                                success: function (response) {
                                                    $('#calendar').fullCalendar('refetchEvents');
                                                    socket.send(resourcename + " zmodyfikowano zajęcia dla " + event.title + " w dniu " + eventdate + " o godzinie " + starttime);

                                                },
                                                error: function (e) {
                                                    alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                                }
                                            });
                                            dialogItself.close();
                                        }
                                    }, {
                                        label: 'Anuluj',
                                        action: function (dialogItself) {
                                            dialogItself.close();
                                        }
                                    }]
                                });
                            }
                        }
                    });


                    //click cancel event button
                    $('#cancelSubmitButton').off('click');
                    $('#cancelSubmitButton').on('click', function (e) {

                        $('#previewEventModal').modal('hide');

                        //reset form to the clear values
                        $('#cancelEventModal').find('form')[0].reset();
                        $('#cancelEventModal').modal('show');

                        //set default value for radio button, and it is single cancel
                        $('input[id="cancelChildEvent"]').prop('checked', true);

                        //confirm that you want cancel event
                        $('#cancelConfirmSubmitButton').off('click');
                        $('#cancelConfirmSubmitButton').on('click', function (e) {

                            //variable to hold radio buttons values with options for cancelling events
                            var cancelOption = getRadioVal(document.getElementById('cancelAppointmentForm'), 'cancelOptions');
                            var category_id = 6;
                            var description2json = $("#cancelDescription").val();

                            if (cancelOption == "cancelSingle") {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=cancelEvent&event_id=' + event_id + '&description=NB:' + description2json + '&category_id=' + category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename + " odwołano zajęcia dla " + event.title + " w dniu " + eventdate + " o godzinie " + starttime);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy odwoływaniu zajęć' + e.responseText);
                                    }

                                })

                            }
                            else if (cancelOption == "cancelAllFromDay") {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=cancelEventFromDay&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&description=NB:' + description2json + '&category_id=' + category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send("Odwołano wszystkie zajęcia dla " + event.title + " w dniu " + eventdate);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy odwoływaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            $('#cancelEventModal').modal('hide');
                        });

                    })
                    //we can revert cancel event by clicking cancel cancel button
                    //click cancel event action
                    $('#cancelCancelSubmitButton').off('click');
                    $('#cancelCancelSubmitButton').on('click', function (e) {

                        //we switch to the normal event
                        var category_id = 1;
                        //and remove cancel reason from description
                        var trimedDescription = $("#preview-description").val();
                        var description2json = trimedDescription.split('NB:')[0];
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin/process.php",
                            data: 'type=cancelEvent&event_id=' + event_id + '&description=' + description2json + '&category_id=' + category_id,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send(resourcename + " odwołane poprzednio zajęcia dla " + event.title + " w dniu " + eventdate + " o godzinie " + starttime + " odbędą się");
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy anulowaniu odwołania zajęć' + e.responseText);
                            }

                        })
                        $('#previewEventModal').modal('hide');
                    });

                }
                /********************************************************************************************************
                 * additnal events processing
                 *
                 *
                 ********************************************************************************************************/
                $('#AdditionalEventSubmitButton').off('click');
                $('#AdditionalEventSubmitButton').on('click', function (e) {
                    $('#previewEventModal').modal('hide');
                    //put values to modal
                    $('#createAdditionalEventModal').find('form')[0].reset();
                    $('#additional_event-date').val($('#previewEventModal #preview-event-date').val());
                    $('#additional_start-time').val($('#previewEventModal #preview-start-time').val());
                    $('#additional_end-time').val($('#previewEventModal #preview-end-time').val());
                    $('#additional_resourceID').val($('#previewEventModal #preview-resourceID').val());
                    $('#createAdditionalEventModal').modal('show');
                });
                $('#additional_submitButton').off('click');
                $('#additional_submitButton').on('click', function (e) {
                    //we need title to print it on notification
                    var additionalTitle = $('#additional_title').val();
                    var additionalDate = $('#additional_event-date').val();
                    var additionalStarttime = $('#additional_start-time').val();
                    var additionalEndtime = $('#additional_end-time').val();
                    var additionalResourceID = event.resources;
                    var additionalCategory = $('#eventType option:selected').val();
                    var additionalDescription = $("#additional-eventDescription").val();
                    var resourceName = $('#preview-resourceID').val();
                    if (document.getElementById('additional_overhours').checked == true) {

                        additionalCategory = 5;
                    }
                    // We don't want this to act as a link so cancel the link action
                    $("#createAdditionalEventModal").modal('hide');
                    e.preventDefault();
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "admin/add-event.php",
                        data: "title=" + additionalTitle + "&event-date=" + additionalDate + "&start-time=" + additionalStarttime + "&end-time=" + additionalEndtime +
                        "&resourceID=" + additionalResourceID + "&eventDescription=" + additionalDescription + "&category_id=" + additionalCategory,
                        success: function () {
                            //alert();
                            $('#calendar').fullCalendar('unselect');
                            $('#calendar').fullCalendar('refetchEvents');
                            socket.send(resourceName + " dodano dodatkowe zjęcia dla " + additionalTitle + " w dniu " + additionalDate + " o godz. " + additionalStarttime);
                        }
                    });
                });
            },

            //when drag and drop existing event
            eventDrop: function (event, delta, revertFunc, resources) {

                //$('#calendar').unbind('taphold');
                var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
                var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
                //var endtime = $.fullCalendar.moment(event.start).add(delta,'ms').format('HH:mm');
                var eventdate = $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
                var resourcename = getResourceNameLocal(resourcesArray, event.resources);//getResourceName(event.resources);
                var resourceID = event.resources;
                $('#editEventModal #edit-title').val(event.title);
                $('#editEventModal #edit-event-date').val(eventdate);
                $('#editEventModal #edit-start-time').val(starttime);
                $('#editEventModal #edit-end-time').val(endtime);
                //$('#editEventModal #edit-resourceID').val(resourcename);
                //assign value to current resourceID
                $('#edit-resourceID').multiselect('select', event.resources);
                $('#editEventModal #edit-description').val(event.description);
                var event_id = event.id;
                var parent_id = event.parent_id;
                var repeat_freq = event.repeat_freq;
                var category_id = event.category_id;
                if (category_id == 5) {

                    $('input[name="editOverhours"]').prop('checked', true);
                }
                else {

                    $('input[name="editOverhours"]').prop('checked', false);
                }
                $('#editEventModal').modal('show');

                $('#edit-confirm-submitButton').off('click');
                $('#edit-confirm-submitButton').on('click', function () {
                    var editStartTime = $('#editEventModal #edit-start-time').val()
                    var editEndTime = $('#editEventModal #edit-end-time').val()
                    var newResourceID = $('#edit-resourceID option:selected').val();
                    // console.log("newResourceID drag n ndrop"+newResourceID);
                    $('#editEventModal').modal('hide');

                    //check if overhours checkededitOverhours
                    if (document.getElementById('editOverhours').checked == true) {

                        category_id = 5;
                    }
                    else {
                        category_id = event.category_id;
                    }
                    //just before sending the form we switching resource name to resource ID
                    $('#editEventModal #edit-resourceID').val(resourceID);

                    //if there is a single event only
                    if (repeat_freq == 0) {
                        BootstrapDialog.confirm({
                            type: BootstrapDialog.TYPE_DANGER,
                            closable: false,
                            title: 'Uwaga',
                            message: 'Czy napewno zmodyfikować zajęcia?',
                            btnCancelLabel: 'Anuluj',
                            btnOKLabel: 'OK',
                            btnOKClass: 'btn-danger',
                            callback: function (result) {

                                if (result == true) {
                                    //$('#editEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/update-event.php",
                                        data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                        success: function (response) {
                                            //$('#calendar').fullCalendar('refetchEvents');
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                            socket.send(resourcename + ". Masz nowe zajęcia z " + event.title + " w dniu " + eventdate + " o godz " + editStartTime);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                                else {
                                    $('#calendar').fullCalendar('rerenderEvents');
                                    //no need so far
                                    //dialogRef.close();
                                }
                            }
                        })
                    }
                    //if there is repeation
                    else if (repeat_freq != 0) {
                        var checkrepeats = dailyorweekly(repeat_freq);
                        BootstrapDialog.show({
                            type: BootstrapDialog.TYPE_DANGER,
                            closable: false,
                            title: 'Uwaga',
                            message: 'Te zajęcia odbywają się ' + checkrepeats + ". Wybierz odpowienią opcję",

                            buttons: [{
                                label: 'Zmień tylko te',
                                cssClass: 'btn-primary',
                                action: function (dialogItself) {
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/update-event.php",
                                        data: $('#editAppointmentForm').serialize() + '&type=update-child-event' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            socket.send(resourcename + ". Masz nowe zajęcia z " + event.title + " w dniu " + eventdate + " o godz " + editStartTime);

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                        }
                                    });
                                    dialogItself.close();
                                }

                            }, {
                                label: 'Zmień wszystkie',
                                cssClass: 'btn-primary',
                                action: function (dialogItself) {
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/update-event.php",
                                        data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq=' + repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id + '&event-start-date=' + eventdate,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            socket.send(resourcename + ". Masz nowe zajęcia z " + event.title + " w dniu " + eventdate + " o godz " + editStartTime);

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                        }
                                    });
                                    dialogItself.close();
                                }
                            }, {
                                label: 'Anuluj',
                                action: function (dialogItself) {
                                    dialogItself.close();
                                    $('#calendar').fullCalendar('refetchEvents');
                                }
                            }]
                        });
                    }
                });
                //need to back to before changes when "Zamknij" button pressed
                $('#edit-close-submitButton').off('click');
                $('#edit-close-submitButton').on('click', function () {
                    $('#calendar').fullCalendar('refetchEvents');
                });
            },

            //when resize existing event
            eventResize: function (event, delta, revertFunc, resources) {
                var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
                var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
                var eventdate = $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
                var resourcename = getResourceNameLocal(resourcesArray, event.resources);//getResourceName(event.resources);
                var resourceID = event.resources;
                $('#editEventModal #edit-title').val(event.title);
                $('#editEventModal #edit-event-date').val(eventdate);
                $('#editEventModal #edit-start-time').val(starttime);
                $('#editEventModal #edit-end-time').val(endtime);
                //$('#editEventModal #edit-resourceID').val(resourcename);
                //assign value to current resourceID
                $('#edit-resourceID').multiselect('select', event.resources);
                $('#editEventModal #edit-description').val(event.description);
                var event_id = event.id;
                var parent_id = event.parent_id;
                var repeat_freq = event.repeat_freq;
                var category_id = event.category_id;
                //set checkbutton according to actual value
                if (category_id == 5) {

                    $('input[name="editOverhours"]').prop('checked', true);
                }
                else {

                    $('input[name="editOverhours"]').prop('checked', false);
                }
                $('#editEventModal').modal('show');
                $('#edit-confirm-submitButton').off('click');
                $('#edit-confirm-submitButton').on('click', function () {
                    var editStartTime = $('#editEventModal #edit-start-time').val()
                    var editEndTime = $('#editEventModal #edit-end-time').val()
                    var newResourceID = $('#edit-resourceID option:selected').val();
                    //console.log("newResourceID resize"+newResourceID);
                    $('#editEventModal').modal('hide');
                    //check if overhours checkededitOverhours
                    if (document.getElementById('editOverhours').checked == true) {

                        category_id = 5;
                    }
                    else {
                        category_id = event.category_id;
                    }

                    //just before sending the form we switching resource name to resource ID
                    $('#editEventModal #edit-resourceID').val(resourceID);

                    //if there is a single event only
                    if (repeat_freq == 0) {
                        BootstrapDialog.confirm({
                            type: BootstrapDialog.TYPE_DANGER,
                            closable: false,
                            title: 'Uwaga',
                            message: 'Czy napewno zmodyfikować zajęcia?',
                            btnCancelLabel: 'Anuluj',
                            btnOKLabel: 'OK',
                            btnOKClass: 'btn-danger',
                            callback: function (result) {

                                if (result == true) {
                                    //$('#editEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/update-event.php",
                                        data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                        success: function (response) {
                                            //$('#calendar').fullCalendar('refetchEvents');
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                            socket.send(resourcename + ". Masz nowe zajęcia z " + event.title + " w dniu " + eventdate + " o godz " + editStartTime);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                                else {
                                    $('#calendar').fullCalendar('refetchEvents');
                                    //no need so far
                                    //dialogRef.close();
                                }
                            }
                        })
                    }
                    //if there is repeation
                    else if (repeat_freq != 0) {
                        var checkrepeats = dailyorweekly(repeat_freq);
                        BootstrapDialog.show({
                            type: BootstrapDialog.TYPE_DANGER,
                            title: 'Uwaga',
                            closable: false,
                            message: 'Te zajęcia odbywają się ' + checkrepeats + ". Wybierz odpowienią opcję",

                            buttons: [{
                                label: 'Zmień tylko te',
                                cssClass: 'btn-primary',
                                action: function (dialogItself) {
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/update-event.php",
                                        data: $('#editAppointmentForm').serialize() + '&type=update-child-event' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                            socket.send(resourcename + ". Masz nowe zajęcia z " + event.title + " w dniu " + eventdate + " o godz " + editStartTime);

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                        }
                                    });
                                    dialogItself.close();
                                }

                            }, {
                                label: 'Zmień wszystkie',
                                cssClass: 'btn-primary',
                                action: function (dialogItself) {
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/update-event.php",
                                        data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&edit-resourceID=' + newResourceID + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq=' + repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id + '&event-start-date=' + eventdate,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            if (response.status == "success")
                                            //TODO: refetch does not work inside, why??
                                            //$('#calendar').fullCalendar('refetchEvents');
                                                socket.send(resourcename + ". Masz nowe zajęcia z " + event.title + " w dniu " + eventdate + " o godz " + editStartTime);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                        }
                                    });
                                    dialogItself.close();
                                }
                            }, {
                                label: 'Anuluj',
                                action: function (dialogItself) {
                                    dialogItself.close();
                                    $('#calendar').fullCalendar('refetchEvents');
                                }
                            }]
                        });
                    }
                });
                //need to back to before changes when "Zamknij" button pressed
                $('#edit-close-submitButton').off('click');
                $('#edit-close-submitButton').on('click', function () {
                    $('#calendar').fullCalendar('refetchEvents');
                });

            },


            eventRender: function (event, element) {
                document.getElementById('loader').style.display = 'none';
                //$('#floatBarsG').hide();
                //detect mobile, we not allow drag drop as it is slow and hard to do it by finger
                if (( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {

                    $('#calendar').fullCalendar('getView').calendar.options.editable = false;
                    /**************************************************************************************************************
                     * highlight all events titile to blue with the same title when event is pressed longer.
                     **************************************************************************************************************/
                    element.on('taphold', function (e) {
                        //get day viewed
                        var currentViewDate = $('#calendar').fullCalendar('getDate')
                        var events = $('#calendar').fullCalendar('clientEvents', function (event) {
                            //get list of events for displayed day
                            if (moment(event.start).format('YYYY-MM-DD') == currentViewDate.format('YYYY-MM-DD')) {
                                return true;
                            }
                        });
                        //search events with the same title as event where is mouse over
                        for (var i = 0; events.length > i; i++) {

                            if (events[i].title == event.title) {

                                events[i].textColor = 'blue'
                            }
                            else {

                                events[i].textColor = ''
                            }
                        }
                        $('#calendar').fullCalendar("rerenderEvents");

                    })

                }
                else {
                    //here we use own taphold for NON mobile.
                    myTaphold(element, event);
                    $('#calendar').fullCalendar('getView').calendar.options.editable = true;

                }

                //disable moving break for now :)
                if (event.title == 'PRZERWA') {

                    event.editable = false;
                }

                //disable moving cancelled events
                if (event.category_id == 6) {

                    event.editable = false;
                    /**********************************************************************************************************
                     *workaround for printing cancelled events,
                     *we cannot use background propoerty because it will no print
                     *we need to use img src as background and add this to .fc-bg, so far so good :)
                     ********************************************************************************************************/
                    element.css('background', "none");
                    element.find('.fc-bg').append('<img src ="/images/cancel_4.svg" width=100% height=100%/>');
                }

                //this  is fix for appearing icons during selecting new event
                if (event.repeat_freq == null) {

                    element.find('.fc-time').append('');
                }

                //glyphicon should appear only when event is created and it is reccurent
                else if (event.repeat_freq != 0) {

                    element.find('.fc-time').append(' <span class="glyphicon glyphicon-refresh"></span>');
                }

                //add description to events
                element.find('.fc-title').append("<br/>" + event.description);

                //this  is fix for appearing custom border during selecting new event
                if (event.description == null) {

                    element.css('border-color', '#FFFFFF');
                }

                //red border should appear only when event is created and it has description
                //"!= null" -- this does not work probably after adding new event there is empty text but not null
                else if (event.description != '') {
                    element.css('border-color', '#ff000f');

                }

                //to have more readable events and see spaces between events in column wee add small margin to events
                $(element).css("margin-bottom", "2px");


            },

        });
        /**************************************************************************************************************
         * checking resources when today button clicked, this need to be after loading fullcalendar
         * explanation under link http://stackoverflow.com/questions/27193160/affecting-fullcalendar-today-button-fc-today-button
         *
         **************************************************************************************************************/

        $(".fc-today-button").click(function () {
            checkResources();
        });
    }, 1000);

    /*****************************************************************************************************************
     * Function taken from http://www.tech.theplayhub.com/long_press_in_javascript/
     * need to put it into eventRender callback.
     * @param elementum
     * @param event
     *****************************************************************************************************************/
    function myTaphold(elementum, event) {

        var longpress = false;
        var startTime, endTime;

        elementum.on('mousedown touchstart', function () {
            startTime = new Date().getTime();
        });
        elementum.on('mouseup touchend', function () {
            endTime = new Date().getTime();
            longpress = (endTime - startTime < 450) ? false : true;
        });
        elementum.on('mousemove', function () {
            longpress = false;
        });
        elementum.on('click', function () {
            if (longpress) {
//console.log("longpres");
                //get day viewed
                var currentViewDate = $('#calendar').fullCalendar('getDate')
                var events = $('#calendar').fullCalendar('clientEvents', function (event) {
                    //get list of events for displayed day
                    if (moment(event.start).format('YYYY-MM-DD') == currentViewDate.format('YYYY-MM-DD')) {
                        return true;
                    }
                });
                //search events with the same title as event where is mouse over
                for (var i = 0; events.length > i; i++) {

                    if (events[i].title == event.title) {

                        events[i].textColor = 'blue'
                    }
                    else {

                        events[i].textColor = ''
                    }
                }
                $('#calendar').fullCalendar("rerenderEvents");
            }
        });
    }

    /*********************************************autocomplete for title start ***********************/

    $('#createEventModal #title').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'query=' + query,
                success: function (data) {
                    process(data);
                    //console.log(data);
                }
            });
        }
    });

    $('#editEventModal #edit-title').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'type=nameAutocomplete&query=' + query,
                success: function (data) {
                    process(data);
                    // console.log(data);
                }
            });
        }
    });
    $('#createStudyModal #studyTitle').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'type=nameAutocomplete&query=' + query,
                success: function (data) {
                    process(data);
                    // console.log(data);
                }
            });
        }
    });
    $('#createAdditionalEventModal #additional_title').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'type=nameAutocomplete&query=' + query,
                success: function (data) {
                    process(data);
                    // console.log(data);
                }
            });
        }
    });
    /**********************************************autocomplete for title end******************************************/

    /*****************************************************************************************************************
     * show option window
     *
     *****************************************************************************************************************/
    $('#optionsButton').off('click')
    $('#optionsButton').on('click', function () {

        $('#submitOptionButton').prop('disabled', true);
        //make sure that check box has correct value according to current settings
        if ($(".fc-view-container .fc-view > table").width() > 1920) {
            $('input[id="id-button-extend"]').prop('checked', true);
        }
        else {
            $('input[id="id-button-extend"]').prop('checked', false);
        }

        $('#optionsModal').modal('show');

        $('input[type=checkbox]').change(function () {

            $('#submitOptionButton').prop('disabled', false);
        });
    });

    /*****************************************************************************************************************
     * drag & drop dynamically on/off
     * this functionality is in two parts, this is first
     * second located in callback eventRender
     *
     *****************************************************************************************************************/
    $('#submitOptionButton').off('click')
    $('#submitOptionButton').on('click', function (e) {
        e.preventDefault();

        if ($('#id-button-extend').is(':checked')) {
            //alert("jest aktywny");
            //$('#calendar').fullCalendar('rerenderEvents');
            $(".fc-view-container").css('width', 'auto');
            $(".fc-view-container .fc-view").css('overflow-x', 'scroll');
            $(".fc-view-container .fc-view > table").css('width', '125%');
            $(".fc-ltr .fc-axis").css('position:relative');
            //allows to see new values
            $(window).resize();
        }
        else {
            $(".fc-view-container").css('width', 'auto');
            $(".fc-view-container .fc-view").css('overflow-x', 'hidden');
            $(".fc-view-container .fc-view > table").css('width', '100%');
            //allows to see new values
            $(window).resize();
        }
        $('#optionsModal').modal('hide');
    });
    /****
     * Need to avoid turn on big screen on tablets
     *
     *****/
    $("#bigScreenCalendar").click(function () {
        if ($(this).is(':checked') && ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {

            BootstrapDialog.alert({
                title: 'Uwaga',
                message: 'funkcja big screen tylko na kompach LENOVO :)',
                type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttonLabel: 'Zamknij' // <-- Default value is 'OK',
            });

            $('#bigScreenCalendar').removeAttr('checked');
        }
        ;
    });
    $('#preview-getPhoneNumberButton').off('click');
    $("#preview-getPhoneNumberButton").click(function () {

        var kidName = $("#preview-title").val();
        var splitted = kidName.split(" ");
        var firstName = splitted[0];
        var lastName = splitted[1];
        //console.log(firstName);
        //console.log(lastName);
        $.ajax({
            url: "admin/process.php",
            type: 'POST',
            dataType: 'JSON',
            data: 'type=getPhoneNumber&firstname=' + firstName + '&lastname=' + lastName,
            success: function (data) {
                if (data[0] == null || data[0] == "") {

                    $(".popover-content").html("brak numeru");
                } else {
                    $(".popover-content").html(data[0]);

                }
            }
        });
    });

    /*********************************************************************************************************
    * fullscreen functionality:
    * single button to toggle fullscreen on off
    * works ONLY with Chrome
    *
    * ********************************************************************************************************/
    //var goFS = document.getElementById("fsButton");
    //
    //goFS.addEventListener("click", function () {
    //
    //    if (!document.webkitIsFullScreen) {
    //
    //        var conf = confirm("Przełączyć na tryb pełnego ekranu?");
    //        var docelem = document.documentElement;
    //
    //        if (conf == true) {
    //            if (document.getElementById('bigScreenCalendar').checked == true) {
    //
    //                $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
    //            }
    //            else {
    //
    //                $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
    //            }
    //
    //            if (docelem.requestFullscreen) {
    //
    //                docelem.requestFullscreen();
    //            }
    //            else if (docelem.mozRequestFullScreen) {
    //
    //                docelem.mozRequestFullScreen();
    //            }
    //            else if (docelem.webkitRequestFullScreen) {
    //
    //                docelem.webkitRequestFullScreen();
    //            }
    //            else if (docelem.msRequestFullscreen) {
    //
    //                docelem.msRequestFullscreen();
    //            }
    //        }
    //    }
    //    else {
    //        $('#calendar').fullCalendar('option', 'aspectRatio', 2.35);
    //        if (document.exitFullscreen) {
    //
    //            document.exitFullscreen();
    //        }
    //        else if (document.mozCancelFullScreen) {
    //
    //            document.mozCancelFullScreen();
    //        }
    //        else if (document.webkitCancelFullScreen()) {
    //
    //            document.webkitCancelFullScreen();
    //        }
    //    }
    //}, false);
});
