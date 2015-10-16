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


//calendar stuff
$(document).ready(function(){

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

    //periodically check if there is change on DB
        setInterval(function(){
            $.ajax({
                cache: false,
                type: "POST",
                datatype: "json",
                url: "admin/process.php",
                //async: false, danger, don't know what how it will dangerous!!!!!
                //async: false,
                data: 'type=getInfoFromDb',
                success: function (data) {
                change = jQuery.parseJSON(data);
                console.log(change.length)
                    if (change.length != 0)
                    {
                        ion.sound.play("Facebook");
        
                        for(var i in change) {
                            var resource = getResourceName(change[i].resourceID);
                            if (change[i].queryType == '1') {
                                toastr["info"]("Dodano nowe zajęcia dla " + change[i].title + " w dniu " + change[i].start, resource + " ,nastąpiła zmiana w kalendarzu o godz: " + moment(change[i].timedate).format("HH:mm"));
                                //$('#calendar-user').fullCalendar('refetchEvents');
                            }
                            else if (change[i].queryType == '2') {
                                toastr["info"]("Zmodyfikowano zajęcia dla " + change[i].title + " w dniu " + change[i].start, resource + " ,nastąpiła zmiana w kalendarzu o godz: " + moment(change[i].timedate).format("HH:mm"));
                                //$('#calendar-user').fullCalendar('refetchEvents');
                            }
                            else if (change[i].queryType == '3') {
                                toastr["info"]("Usunięto zajęcia dla " + change[i].title + " w dniu " + change[i].start, resource + " ,nastąpiła zmiana w kalendarzu o godz: " + moment(change[i].timedate).format("HH:mm"));
                                //$('#calendar-user').fullCalendar('refetchEvents');
                            }
                        };
                        $('#calendar-user').fullCalendar('refetchEvents');
                    }
                    ion.sound.destroy("Facebook");
                }
                //error: function (e) {
                //    alert('Wystąpił następujący błąd przy aktualizacji informacji z bazy danych:' + e.responseText);
                //}
            });

        },30000);


    //configure multiselect plugin for view dropdown
    $('#selectView').multiselect({

        enableHTML: false,
        buttonClass: 'btn btn-default',
        inheritClass: false,
        buttonWidth: 'auto',
        buttonContainer: '<div class="btn-group" />',
        dropRight: false,
        selectedClass: 'active'

    });
//configure multiseletc plugin for resources dropdown
    $('#selectResource').multiselect({


        includeSelectAllOption: true,
        allSelectedText: 'Wszyscy widoczni',
        selectAllText: 'Pokaz wszystkich',
        nSelectedText: 'wybranych'




    });

    //click event for exporting calendar to excell, not working
    $('#exportButton').on('click', function () {
       // $('#calendar-user').fullCalendar('destroy');
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

    //take resources from db and put them into dropdown
    function loadResources() {

        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                $.each(data, function(i, resource) {
                    $("#selectResource").append('<option value="' + resource.id + '"selected="selected" >' + resource.name + '</option>');
                });
                $('#selectResource').multiselect('rebuild');
            },
            error: function(data) {
                alert(data);
            }

        });

    }

    //cofiguring sounds notification
    ion.sound({
        sounds: [
            {name: "Facebook"}
        ],

        // main config
        path: "/sounds/",
        preload: true,
        multiplay: true,
        volume: 0.9
    });



    //for resources filtering
    $('#selectResource').change(function(){
        element.fullCalendar('render', true);
    });
/**********************for checking value checkboxes begin**************************/

function getRadioVal(form, name) {
    var val;
    // get list of radio buttons with specified name
    var radios = form.elements[name];

    // loop through list of radio buttons
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            val = radios[i].value; // if so, hold its value in val
            break; // and break out of for loop
        }
    }
    return val; // return value of checked radio or undefined if none checked
}

/**********************for checking value checkboxes end**************************/
//load all resources to dropdown menu
loadResources();
    var element = $('#calendar-user');

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    //detect mobile device
    var isWebkit = 'WebkitAppearance' in document.documentElement.style

//need add timeout because fullcalendar is loaded befor resources and this look bad
setTimeout(function () {
        element.fullCalendar({

            //height: '100',
            //contentHeight:'9',
            //aspectRatio: '2.3',//<--this is for display 1600x900
            //aspectRatio: '1.6', //<--this is for display 1270x720
            //aspectRatio: '2.6', //<--this is for display 1024x600
            aspectRatio: '2.3',//<--this is for display galaxy tab 10

            header: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            lang: 'pl',
            defaultView: 'resourceDay',
            editable: true,
            droppable: false,
            selectable: false,
            selectHelper: false,
            minTime: "08:00:00",
            maxTime: "18:00:00",
            displayEventEnd: true,
            weekends: true,
            allDaySlot: false,
            eventTextColor: "black",
            unselectCancel: '.modal-dialog',
            lazyFetching: true,
            //define resource source
            resources: "admin/json-resources.php",
            eventStartEditable: false,
            eventDurationEditable: false,

            //define events source
            events:
            {
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

   //resources filtering taken from github churchdesk/fullcalendar, end


    viewRender: function(view, element) {

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
            $("#customDateButton").on("changeDate", function (event) {

                customDate = $("#customDateButton").datepicker('getFormattedDate')
                //console.log(customDate);
                $('#calendar-user').fullCalendar('gotoDate', customDate);


            });
        });
        //click refresh view button
        $('#selectView-refresh').off('click');
        $('#selectView-refresh').on('click', function () {

            //hold which view is selected from dropdown
            viewOption = $('#selectView option:selected').val();


            if (viewOption == 'viewStd') {

                //change row height for standard view
                element.find('.fc-slats td').css({"height": "2.5em"})
                //this allows to set new values
                $(window).resize();

            }
            else {

                //change row height for extended view
                element.find('.fc-slats td').css({"height": "6.5em"})
                //need this to see new row height
                $(window).resize();

            }

        });

        //click print button
        $('#printButton').off('click')
        $('#printButton').on('click', function () {

           if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
           {
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
               //need to put print window into function otherwise view cannot change so quick, set timeout provide some delay
               // after clicking height need to be adjusted to lanscape paper
               $('#calendar-user').fullCalendar('option', 'height', 'auto');
               //need to decrese row height to squize time from 8 to 17 on a4 paper
               element.find('.fc-slats td').css({"height": "2.3em"});
               //allows to see new values
               $(window).resize();
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
                           $('#calendar-user').fullCalendar('option', 'height', '');
                           //set aspect ratio
                           element.fullCalendar('option', 'aspectRatio', 2.3);
                           //set row height
                           element.find('.fc-slats td').css({"height": "2.5em"});

                       }

                   });
               }
           }

        });
    },


/* !!!!!!!!!!!!!!!!!!!!!!!NOT working!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     eventMouseover: function( event, jsEvent, view ) {

         //get day viewed
         var currentViewDate = $('#calendar-user').fullCalendar('getDate')


         var events = $('#calendar-user').fullCalendar('clientEvents', function (event) {
             //get list of events for displayed day
             if (moment(event.start).format('YYYY-MM-DD') == currentViewDate.format('YYYY-MM-DD')) {
                 return true;

             }


         });

         //search events with the same title as event where is mouse over
         for (var i = 0; events.length > i; i++) {

             if (events[i].title == event.title) {
                 events[i].borderColor = 'blue'
                 console.log(event.title)


             }


         }
         $('#calendar-user').fullCalendar("rerenderEvents");

     },*/






            //action when click on calendar to add new event
            // start
            //TODO: enable change date from form, maybe date picker?, how to display resource name rather than resource id
    select: function (start, end, jsEvent, view, resources) {



                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_DANGER,
                    closable: false,
                    title: 'Uwaga',
                    message: 'Wybierz odpowiednią opcję',

                    buttons: [{
                        label: 'Nowe zajęcia',
                        cssClass: 'btn-success',
                        action: function (dialogItself) {
                            //set color for typical lesson
                            var category = 1;

                            dialogItself.close();
                            //reset form to the clear values
                            $('#createEventModal').find('form')[0].reset();
                            //human read start end and day

                            var starttime = $.fullCalendar.moment(start).format('HH:mm');
                            var endtime = $.fullCalendar.moment(end).format('HH:mm');
                            var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                            var resourcename = getResourceName(resources);
                            var resourceID = resources;

                            $('#createEventModal #event-date').val(eventdate);
                            $('#createEventModal #start-time').val(starttime);
                            $('#createEventModal #end-time').val(endtime);
                            $('#createEventModal #resourceID').val(resourcename);
                            $('#createEventModal').modal('show');

                            // assign function to onclick property of checkbox
                            //default we don't wanna see repeat-freq options
                            document.getElementById('repeatFreqDiv').style.display = 'none';
                            //now if we click repeats we schould see hidden options
                            document.getElementById('repeats').onclick = function() {
                                // access properties using this keyword
                                if ( this.checked ) {
                                    document.getElementById('repeatFreqDiv').style.display = 'block';
                                } else {
                                    //if repeats not checked we reset values and hide 
                                    $('input[name="repeat-freq"]').prop('checked', false);
                                    document.getElementById('repeatFreqDiv').style.display = 'none';
                                    }


                            };

                            //simple validation for title, just diable submit button if title is empty
                            $('#submitButton').prop('disabled',true);
                            $('#createEventModal #title').keyup(function(){
                                $('#submitButton').prop('disabled', this.value == "" ? true : false);
                            });



                            //fix for looping when add second third etc.. event
                            $('#submitButton').off('click')
                            //now when click submit on form
                            $('#submitButton').on('click', function (e) {


                                //there is problem with pass to php starttime and endtime from form,
                                //need to walkaround , so manually pass these two values to the PHP
                                var starttime2 = $('#createEventModal #start-time').val();
                                var endtime2 = $('#createEventModal #end-time').val();

                                //compare dates to check if range is corrcet
                                if (!(moment(starttime2, 'HH:mm').isBefore(moment(endtime2, 'HH:mm')))) {
                                    alert("nie no bez jaj, ustaw poprawnie czas rozpoczecia i zakoczenia zajeć")
                                    $('#submitButton').prop('disabled', true);
                                }
                                else {

                                    // We don't want this to act as a link so cancel the link action
                                    $("#createEventModal").modal('hide');
                                    //just before sending the form we switching resource name to resource ID
                                    $('#createEventModal #resourceID').val(resourceID);
                                    e.preventDefault();
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        url: "admin/add-event.php",
                                        data: $('#createAppointmentForm').serialize() + "&category_id=" + category + "&start-time=" + starttime2 + "&end-time=" + endtime2,
                                        success: function () {
                                            
                                            $('#calendar-user').fullCalendar('unselect');
                                            $('#calendar-user').fullCalendar('refetchEvents');

                                        }

                                    });
                                }
                            });


                        }

                    }, {
                        label: 'Nowe badanie',
                        cssClass: 'btn-success',
                        action: function (dialogItself) {
                            //set color for study
                            var category = 2;

                            dialogItself.close();
                            //reset form to the clear values
                            $('#createStudyModal').find('form')[0].reset();
                            //human read start end and day

                            var starttime = $.fullCalendar.moment(start).format('HH:mm');
                            var endtime = $.fullCalendar.moment(end).format('HH:mm');
                            var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                            var resourcename = getResourceName(resources);
                            var resourceID = resources;
                            var mywhen = starttime + ' - ' + endtime + ' dnia: ' + eventdate + ' dla: ' + resourceID;
                            $('#createStudyModal #studyDate').val(eventdate);
                            $('#createStudyModal #studyStartTime').val(starttime);
                            $('#createStudyModal #studyEndTime').val(endtime);
                            $('#createStudyModal #studyResourceID').val(resourcename);
                            //$('#createStudyModal #studyDescription').val(event.description);
                            $('#createStudyModal').modal('show');

                            //fix for looping when add second third etc.. event
                            $('#study-submitButton').off('click')

                            //now when click submit on form
                            $('#study-submitButton').on('click', function (e) {

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
                                        $('#calendar-user').fullCalendar( 'unselect' );
                                        $('#calendar-user').fullCalendar('refetchEvents');

                                    }

                                });

                            });

                        }

                    }, {
                        label: 'Przerwa',
                        cssClass: 'btn-success',
                        action: function (dialogItself) {

                            //set color for break
                            var category = 3;

                            dialogItself.close();
                            //reset form to the clear values
                            $('#createBreakModal').find('form')[0].reset();
                            //human read start end and day

                            var starttime = $.fullCalendar.moment(start).format('HH:mm');
                            var endtime = $.fullCalendar.moment(end).format('HH:mm');
                            var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                            var resourcename = getResourceName(resources);
                            var resourceID = resources;
                            var mywhen = starttime + ' - ' + endtime + ' dnia: ' + eventdate + ' dla: ' + resourceID;
                            $('#createBreakModal #breakDate').val(eventdate);
                            $('#createBreakModal #breakStartTime').val(starttime);
                            $('#createBreakModal #breakEndTime').val(endtime);
                            $('#createBreakModal #breakResourceID').val(resourcename);
                            $('#createBreakModal').modal('show');

                            //fix for looping when add second third etc.. event
                            $('#break-submitButton').off('click')

                            //now when click submit on form
                            $('#break-submitButton').on('click', function (e) {
                                // We don't want this to act as a link so cancel the link action
                                $("#createBreakModal").modal('hide');
                                //just before sending the form we switching resource name to resource ID
                                $('#createBreakModal #breakResourceID').val(resourceID);
                                e.preventDefault();
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    url: "admin/add-break.php",
                                    data: $('#BreakAppointmentForm').serialize() + "&category_id=" + category,
                                    success: function () {
                                        //alert();
                                        $('#calendar-user').fullCalendar( 'unselect' );
                                        $('#calendar-user').fullCalendar('refetchEvents');

                                    }

                                });

                            });


                        }
                    }, {
                        label: 'Anuluj',
                        action: function (dialogItself) {
                            dialogItself.close()
                            $('#calendar-user').fullCalendar( 'unselect' );

                        }
                    }

                    ]
                });

        //added cancel class to the "cancel buutons in any modals to unselect uncreated event"
        $('.cancel').off('click')
        //now when click cancel on form
        $('.cancel').on('click', function (e) {

            $('#calendar-user').fullCalendar( 'unselect' );

        });



            },

            //prepare action when event has been clicked

            //prepare action when event has been clicked
            eventClick: function (event, jsEvent, view, resources) {

                //human readable values inside modal form, so we changing format
                var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
                var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
                var eventdate = $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
                var resourcename = getResourceName(event.resources);
                var resourceID = event.resources;
                var category_id = event.category_id;

                //below variables need go to the query to check if there is repeat for this event,
                var event_id = event.id;
                var parent_id = event.parent_id;
                var repeat_freq = event.repeat_freq;
                var title = event.title;
                var checkrepeats = dailyorweekly(repeat_freq);
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
                        //console.log(repeat_freq);
                        $('#previewBreakModal').modal('hide');

                        //select visibility of elements. Need to be reproduced on another values!!!!!!!!!!!!!
                        if (repeat_freq == 0)
                        {
                            document.getElementById('divAllBreak').style.display = 'none';

                        }
                        else
                        {
                            document.getElementById('divAllBreak').style.display = 'block';
                        }
                        $("label[for='checkRepeatsLabel']").html("<strong>" + checkrepeats + "</strong>");
                        $('#deleteBreakeModal').modal('show');

                        var deleteOption = getRadioVal(document.getElementById('deleteBreak'), 'deleteBreak');
                        //fix for looping when add second third etc.. event
                        $('#deleteBreakConfirmSubmitButton').off('click');

                        // if "delete button clicked on prewiev modal"
                        $('#deleteBreakConfirmSubmitButton').on('click', function () {


                            if (repeat_freq == 0)
                            {
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else if(repeat_freq != 0 && deleteOption == 'deleteBreakSingle')
                            {
                                console.log(deleteOption);
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-child-event&event_id=' + event_id,
                                    success: function (response) {
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar').fullCalendar('refetchEvents');
                                            console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })

                            }
                            else if(repeat_freq != 0 && deleteOption == 'deleteAllBreak')
                            {
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                    success: function (response) {
                                        $('#calendar-user').fullCalendar('refetchEvents');

                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar').fullCalendar('refetchEvents');
                                            console.log(response);
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
                    if(event.category_id == 5)
                    {

                        $('input[name="previewOverhours"]').prop('checked', true);
                    }
                    else
                    {

                        $('input[name="previewOverhours"]').prop('checked', false);
                    }
                    //check if event has been cancelled,
                    //if yes then need hide cancel event button, but we need show button to cancel cancel button
                    if(event.category_id == 6)
                    {

                        document.getElementById('cancelCancelSubmitButton').style.display = 'block';
                        document.getElementById('cancelSubmitButton').style.display = 'none';

                    }
                    //if not cancelled then we can simply enable this button
                    else
                    {
                        document.getElementById('cancelCancelSubmitButton').style.display = 'none';
                        document.getElementById('cancelSubmitButton').style.display = 'block';

                    }
                    //we also don't want to see cancel button nor cancel cancel when leave or break is current event
                    if(event.category_id == 3 || event.category_id == 4)
                    {

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
                                $('#calendar-user').fullCalendar('refetchEvents');
                                console.log(response);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy dodawaniu opisu' + e.responseText);
                            }
                        })

                        $('#preview-description').prop("readonly", true);
                        document.getElementById('previewDescriptionButtons').style.display = 'none';
                        $('#edit-submitButton').prop('disabled', false);
                        $('#delete-submitButton').prop('disabled', false);
                    });

                    $('#previewDescriptionButtonCancel').off('click');
                    $('#previewDescriptionButtonCancel').on('click', function () {
                        $('#previewEventModal #preview-description').val(event.description);
                        $('#preview-description').prop("readonly", true);
                        document.getElementById('previewDescriptionButtons').style.display = 'none';
                        $('#edit-submitButton').prop('disabled', false);
                        $('#delete-submitButton').prop('disabled', false);

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
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar-user').fullCalendar('refetchEvents');
                                            console.log(response);
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
                                            console.log(response.status);
                                            //$('#calendar').fullCalendar('refetchEvents');
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar-user').fullCalendar('refetchEvents');
                                            console.log(response);
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
                                    console.log(deleteOptionRepeat);
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-child-event&event_id=' + event_id,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            if (response.status == "success")
                                            //TODO: refetch does not work inside, why??
                                            //$('#calendar').fullCalendar('refetchEvents');
                                                console.log(response);
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
                                            console.log(response.status);
                                            //$('#calendar').fullCalendar('refetchEvents');
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                            console.log(response);
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
                                        data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');

                                            if (response.status == "success")
                                            //TODO: refetch does not work inside, why??
                                            //$('#calendar').fullCalendar('refetchEvents');
                                                console.log(response);
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
                        $('#editEventModal #edit-resourceID').val(resourcename);
                        $('#editEventModal #edit-description').val(event.description);

                        var event_id = event.id;
                        var parent_id = event.parent_id;
                        var repeat_freq = event.repeat_freq;
                        var resourceID = event.resources;
                        var category_id = event.category_id;

                        var old_edit_title =  $('#editEventModal #edit-title').val(event.title);

                        //check if this event is overtime
                        if(event.category_id == 5)
                        {

                            $('input[name="editOverhours"]').prop('checked', true);
                        }
                        else
                        {

                            $('input[name="editOverhours"]').prop('checked', false);
                        }

                        //check if event is canelled or leave , if yes we should remove edit overtime,
                        if ( event.category_id == 6)
                        {
                            $('#editOverhours').prop('disabled', true);
                            $('#edit-confirm-submitButton').prop('disabled',true);
                            $('#editEventModal #edit-title').off('change');
                            $('#editEventModal #edit-title').change(function(){
                                $('#edit-confirm-submitButton').prop('disabled', false);
                                $('#editOverhours').prop('disabled', false);
                            });


                        }
                        else
                        {
                            $('#editOverhours').prop('disabled', false);
                            $('#edit-confirm-submitButton').prop('disabled',false);
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
                                    $('#calendar-user').fullCalendar('refetchEvents');
                                    console.log(response);
                                    if (response.status == "success")
                                    //TODO: refetch does not work inside, why??
                                    //$('#calendar').fullCalendar('refetchEvents');
                                        console.log(response);

                                },
                                error: function (e) {
                                    alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                }
                            });

                        }
                        else
                        {
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
                                                data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                                success: function (response) {
                                                    //$('#calendar').fullCalendar('refetchEvents');
                                                    //TODO: refetch does not work inside, why??
                                                    $('#calendar-user').fullCalendar('refetchEvents');
                                                    console.log(response);
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
                                                data: $('#editAppointmentForm').serialize() + '&type=update-child-event' + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&description=' + editDescription,
                                                success: function (response) {
                                                    $('#calendar-user').fullCalendar('refetchEvents');
                                                    console.log(response);
                                                    if (response.status == "success")
                                                    //TODO: refetch does not work inside, why??
                                                    //$('#calendar-user').fullCalendar('refetchEvents');
                                                        console.log(response);

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
                                                data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq=' + repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                                success: function (response) {
                                                    $('#calendar-user').fullCalendar('refetchEvents');
                                                    if (response.status == "success")
                                                    //TODO: refetch does not work inside, why??
                                                    //$('#calendar-user').fullCalendar('refetchEvents');
                                                        console.log(response);
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

                            if (cancelOption == "cancelSingle")
                            {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=cancelEvent&event_id=' + event_id + '&description= NB ' + description2json + '&category_id=' +category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy odwoływaniu zajęć' + e.responseText);
                                    }

                                })

                            }
                            else if (cancelOption == "cancelAllFromDay")
                            {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=cancelEventFromDay&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&description= NB ' + description2json + '&category_id=' +category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        console.log(response);
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
                        //and clear description
                        var description2json = ""
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin/process.php",
                            data: 'type=cancelEvent&event_id=' + event_id + '&description=' + description2json + '&category_id=' +category_id,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar-user').fullCalendar('refetchEvents');
                                console.log(response);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy anulowaniu odwołania zajęć' + e.responseText);
                            }

                        })
                        $('#previewEventModal').modal('hide');
                    });

                }
            },

         //when drag and drop existing event
    eventDrop: function(event, delta, revertFunc, resources) {
            var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
            var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
            var eventdate =  $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
            var resourcename = getResourceName(event.resources);
            var resourceID = event.resources;
            $('#editEventModal #edit-title').val(event.title);
            $('#editEventModal #edit-event-date').val(eventdate);
            $('#editEventModal #edit-start-time').val(starttime);
            $('#editEventModal #edit-end-time').val(endtime);
            $('#editEventModal #edit-resourceID').val(resourcename);
            $('#editEventModal #edit-description').val(event.description);
            var event_id = event.id;
            var parent_id = event.parent_id;
            var repeat_freq = event.repeat_freq;
            var category_id = event.category_id;
            $('#editEventModal').modal('show');


            $('#edit-confirm-submitButton').off('click');
            $('#edit-confirm-submitButton').on('click', function() {
                var editStartTime = $('#editEventModal #edit-start-time').val()
                var editEndTime = $('#editEventModal #edit-end-time').val()
                $('#editEventModal').modal('hide');
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
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events'+'&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        //$('#calendar-user').fullCalendar('refetchEvents');
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        //console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else{
                                $('#calendar-user').fullCalendar('refetchEvents');
                                //no need so far
                                //dialogRef.close();
                            }
                        }
                    })
                }
                //if there is repeation
                else if (repeat_freq != 0){
                    var checkrepeats = dailyorweekly(repeat_freq);
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_DANGER,
                        closable: false,
                        title: 'Uwaga',
                        message: 'Te zajęcia odbywają się ' + checkrepeats+ ". Wybierz odpowienią opcję",

                        buttons: [{
                            label: 'Zmień tylko te',
                            cssClass: 'btn-primary',
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-child-event'+'&event_id=' + event_id+ '&repeat_freq='+ repeat_freq+ '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        //console.log(response);
                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar-user').fullCalendar('refetchEvents');
                                            console.log(response);
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
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq='+ repeat_freq  + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar-user').fullCalendar('refetchEvents');
                                            console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                    }
                                });
                                dialogItself.close();
                            }
                        }, {
                            label: 'Anuluj',
                            action: function(dialogItself){
                                dialogItself.close();
                                $('#calendar-user').fullCalendar('refetchEvents');
                            }
                        }]
                    });
                }
            });
            //need to back to before changes when "Zamknij" button pressed
            $('#edit-close-submitButton').off('click');
            $('#edit-close-submitButton').on('click', function(){
                $('#calendar-user').fullCalendar('refetchEvents');
            });
        },

        //when resize existing event
    eventResize: function(event, delta, revertFunc, resources) {
            var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
            var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
            var eventdate =  $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
            var resourcename = getResourceName(event.resources);
            var resourceID = event.resources;
            $('#editEventModal #edit-title').val(event.title);
            $('#editEventModal #edit-event-date').val(eventdate);
            $('#editEventModal #edit-start-time').val(starttime);
            $('#editEventModal #edit-end-time').val(endtime);
            $('#editEventModal #edit-resourceID').val(resourcename);
            $('#editEventModal #edit-description').val(event.description);
            var event_id = event.id;
            var parent_id = event.parent_id;
            var repeat_freq = event.repeat_freq;
            var category_id = event.category_id;
            $('#editEventModal').modal('show');
            $('#edit-confirm-submitButton').off('click');
            $('#edit-confirm-submitButton').on('click', function() {
                var editStartTime = $('#editEventModal #edit-start-time').val()
                var editEndTime = $('#editEventModal #edit-end-time').val()
                $('#editEventModal').modal('hide');
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
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events'+'&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        //$('#calendar-user').fullCalendar('refetchEvents');
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        //console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else{
                                $('#calendar-user').fullCalendar('refetchEvents');
                                //no need so far
                                //dialogRef.close();
                            }
                        }
                    })
                }
                //if there is repeation
                else if (repeat_freq != 0){
                    var checkrepeats = dailyorweekly(repeat_freq);
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_DANGER,
                        title: 'Uwaga',
                        closable: false,
                        message: 'Te zajęcia odbywają się ' + checkrepeats+ ". Wybierz odpowienią opcję",

                        buttons: [{
                            label: 'Zmień tylko te',
                            cssClass: 'btn-primary',
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-child-event'+'&event_id=' + event_id+ '&repeat_freq='+ repeat_freq+ '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        //console.log(response);
                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar-user').fullCalendar('refetchEvents');
                                            console.log(response);
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
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq='+ repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        $('#calendar-user').fullCalendar('refetchEvents');
                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar-user').fullCalendar('refetchEvents');
                                            console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                    }
                                });
                                dialogItself.close();
                            }
                        }, {
                            label: 'Anuluj',
                            action: function(dialogItself){
                                dialogItself.close();
                                $('#calendar-user').fullCalendar('refetchEvents');
                            }
                        }]
                    });
                }
            });
            //need to back to before changes when "Zamknij" button pressed
            $('#edit-close-submitButton').off('click');
            $('#edit-close-submitButton').on('click', function(){
                $('#calendar-user').fullCalendar('refetchEvents');
            });

        },



    eventRender: function (event, element) {

        //disable moving break for now :)
        if (event.title == 'PRZERWA') {

            event.editable = false;
        }
        //disable moving cancelled events
        if (event.category_id == 6) {

            event.editable = false;
            /**********************************************************************************************************
             workaround for printing cancelled events,
             we cannot use background propoerty because it will no print
             we need to use img src as background and add this to .fc-bg, so far so good :)
             *********************************************************************************************************/
            element.css('background', "none");
            element.find('.fc-bg').append('<img src ="/images/cancel2.png" width=100% height=100%/>');

        }

        //this  is fix for appearing icons during selecting new event
        if (event.repeat_freq == null) {

            element.find('.fc-time').append('');
        }
        //glyphicon should appear only when event is created and it is reccurent
        else if(event.repeat_freq != 0)
        {
            element.find('.fc-time').append(' <span class="glyphicon glyphicon-refresh"></span>');
        }


        element.find('.fc-title').append("<br/>" + event.description);

        //this  is fix for appearing custom border during selecting new event
        if (event.description == null ) {

            element.css('border-color', '#FFFFFF');


        }
        //red border should appear only when event is created and it has description
        //"!= null" -- this does not work probably afteradding new event there is emptytext but not null
        else if (event.description != '')
        {
            element.css('border-color', '#ff000f');

        }
        //experimental  put some


        //to have more readable events and see spaces between events in column wee add small margin to events
        $(element).css("margin-bottom", "2px");
        }


    });
}, 1000);

    /**********************for changing view begin**************************/





    /*********************************************autocomplete for title start ***********************/
    $('#createEventModal #title').typeahead({

        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'type=nameAutocomplete&query=' + query,
                success: function(data) {
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
                success: function(data) {
                    process(data);
                    //console.log(data);
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
                success: function(data) {
                    process(data);
                    //console.log(data);
                }
            });
        }
    });
    /**********************************************autocomplete for title end******************************************/

    /**********************************************about window start******************************************/
    $('#aboutButton').off('click')
    $('#aboutButton').on('click', function () {
        BootstrapDialog.alert({
            title: 'O programie',
            message: 'Szczepan Rudnicki, szczepan.rudnicki@gmail.com, 2015',
            type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            buttonLabel: 'Zamknij' // <-- Default value is 'OK',
        });



    });


    /**********************************************about window end******************************************/
});
