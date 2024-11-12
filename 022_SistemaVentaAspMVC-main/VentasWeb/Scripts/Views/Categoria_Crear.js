< script >

    $(document).ready(function() {

        function validateFields() {
            let isValid = true;


            const today = new Date();
            today.setHours(0, 0, 0, 0);


            const startDate = new Date($('#txtstartDate').val());
            if ($('#txtstartDate').val() === '') {
                $('#startDateError').text('Fecha de inicio requerida.').show();
                $('#txtstartDate').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else if (startDate < today) {
                $('#startDateError').text('La fecha de inicio no puede ser anterior al día actual.').show();
                $('#txtstartDate').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else {
                $('#startDateError').hide();
                $('#txtstartDate').removeClass('is-invalid').addClass('is-valid');
            }


            const endDate = new Date($('#txtendDate').val());
            if ($('#txtendDate').val() === '') {
                $('#endDateError').text('Fecha de fin requerida.').show();
                $('#txtendDate').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else if (endDate < startDate) {
                $('#endDateError').text('La fecha de fin no puede ser anterior a la fecha de inicio.').show();
                $('#txtendDate').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else if (endDate.getTime() === startDate.getTime()) {
                $('#endDateError').text('La fecha de fin no puede ser igual a la fecha de inicio.').show();
                $('#txtendDate').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else {
                $('#endDateError').hide();
                $('#txtendDate').removeClass('is-invalid').addClass('is-valid');
            }


            const startTime = $('#txtstartTime').val();
            if (startTime === '') {
                $('#startTimeError').text('Hora de inicio requerida.').show();
                $('#txtstartTime').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else {
                $('#startTimeError').hide();
                $('#txtstartTime').removeClass('is-invalid').addClass('is-valid');
            }


            const endTime = $('#txtendTime').val();
            if (endTime === '') {
                $('#endTimeError').text('Hora de fin requerida.').show();
                $('#txtendTime').removeClass('is-valid').addClass('is-invalid');
                isValid = false;
            } else {

                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);


                const startDateTime = new Date();
                startDateTime.setHours(startHour, startMinute, 0, 0);

                const endDateTime = new Date();
                endDateTime.setHours(endHour, endMinute, 0, 0);

                const fourHoursLater = new Date(startDateTime);
                fourHoursLater.setHours(startHour + 4, startMinute);

                console.log("Hora de inicio:", startDateTime);
                console.log("Hora de fin:", endDateTime);
                console.log("Hora de inicio + 4 horas:", fourHoursLater);

                if (endDateTime < fourHoursLater) {
                    $('#endTimeError').text('La hora de fin debe ser al menos 4 horas mayor que la hora de inicio.').show();
                    $('#txtendTime').removeClass('is-valid').addClass('is-invalid');
                    isValid = false;
                } else if (endDateTime.getTime() === startDateTime.getTime()) {
                    $('#endTimeError').text('La hora de fin no puede ser igual a la hora de inicio.').show();
                    $('#txtendTime').removeClass('is-valid').addClass('is-invalid');
                    isValid = false;
                } else {
                    $('#endTimeError').hide();
                    $('#txtendTime').removeClass('is-invalid').addClass('is-valid');
                }
            }


            $('#btnregistrar').prop('disabled', !isValid);
        }


        $('#txtstartDate, #txtendDate, #txtstartTime, #txtendTime').on('input change', function() {
            validateFields();
        });
    });


$(document).ready(function() {
            loadAssignedList();
            loadNurseList();
            loadSchoolList();


            function loadAssignedList() {
                $.ajax({
                    url: '/Assigment/GetNurseSchoolAssignments',
                    type: 'GET',
                    success: function(data) {
                        try {
                            data = typeof data === 'string' ? JSON.parse(data) : data;
                        } catch (e) {
                            showAlert("Error al procesar los datos de asignaciones.", false);
                            return;
                        }

                        if (!Array.isArray(data)) {
                            showAlert("Se esperaban datos válidos.", false);
                            return;
                        }


                        data.reverse();


                        const startDateFilter = new Date($('#startDateFilter').val());
                        const endDateFilter = new Date($('#endDateFilter').val());


                        $('#tabla tbody').empty();

                        data.forEach(function(assignment) {
                            var dateOptions = {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            };
                            var startDate = new Date(assignment.Item6);
                            var endDate = assignment.Item7 ? new Date(assignment.Item7) : null;


                            if ((!isNaN(startDateFilter.getTime()) && startDate < startDateFilter) ||
                                (!isNaN(endDateFilter.getTime()) && endDate > endDateFilter)) {
                                return;
                            }

                            var dateDisplay = startDate.toLocaleDateString('es-ES', dateOptions);
                            if (endDate) {
                                var endDateDisplay = endDate.toLocaleDateString('es-ES', dateOptions);
                                dateDisplay += ' - ' + endDateDisplay;
                            }
                            var row = `<tr>
                                    <td style="display:none;">${assignment.Item1}</td>
                                    <td style="display:none;">${assignment.Item2}</td>
                                    <td>${assignment.Item3}</td>
                                    <td>${assignment.Item4}</td>
                                    <td>${assignment.Item5}</td>
                                    <td>${dateDisplay}</td>
                                    <td><button class="btn-reasignar" data-id="${assignment.Item1}">Reasignar</button></td>
                                </tr>`;
                            $('#tabla tbody').append(row);
                        });


                        $('#tabla tbody tr').dblclick(function() {
                            var idNurse = $(this).find('td:eq(0)').text();
                            var nurseName = $(this).find('td:eq(2)').text();
                            loadNurseHistoryAssignments(idNurse, nurseName);
                            $('#HistoryModal').modal('show');
                        });
                    },
                    error: function() {
                        showAlert("Error en la solicitud de asignaciones.", false);
                    }
                });
            }


            $('#btnFiltrar').on('click', function() {
                loadAssignedList();
            });

            $('#tabla').on('click', '.btn-reasignar', function() {
                var idNurse = $(this).closest('tr').find('td').eq(0).text();
                var idSchool = $(this).closest('tr').find('td').eq(1).text();
                var fullNameNurse = $(this).closest('tr').find('td').eq(2).text();
                var schoolName = $(this).closest('tr').find('td').eq(4).text();


                $('#txtidNurseR').val(idNurse);
                $('#txtCurrentSchoolIdR').val(idSchool);
                $('#txtidNameNurseR').val(fullNameNurse);
                $('#txtnameSchoolR').val(schoolName);

                $('#zonaSelect').empty().append(`
                <option value="Todas" disabled selected>Seleccione</option>
                <option value="Todas">Todas</option>
                <option value="North Zone">North Zone</option>
                <option value="East Zone">East Zone</option>
                <option value="West Zone">West Zone</option>
                <option value="South Zone">South Zone</option>
                <option value="Central Zone">Central Zone</option>`);

                $('#escuelaSelect').empty().append('<option value="" disabled selected>Seleccione</option>');

                $('#ResignacionModal').modal('show');
            });

            // =============================
            // Asignar Enfermera
            // =============================

            function loadNurseList() {
                $.ajax({
                    url: '/Assigment/GetAllNurse',
                    type: 'GET',
                    success: function(data) {
                        try {
                            data = typeof data === 'string' ? JSON.parse(data) : data;
                        } catch (e) {
                            showAlert("Error al procesar los datos de enfermeros.", false);
                            return;
                        }

                        if (!Array.isArray(data)) {
                            showAlert("Se esperaban datos válidos.", false);
                            return;
                        }

                        $('#tableNurse tbody').empty();
                        data.forEach(function(assignment) {
                            var row = `<tr>
                                                <td style="display:none;">${assignment.Item1}</td>
                                                <td>${assignment.Item3}</td>
                                                <td>${assignment.Item2}</td>
                                                <td>${assignment.Item4}</td>
                                                <td><button class="btn-asignar" data-id="${assignment.Item1}" data-fullname="${assignment.Item2} (${assignment.Item4})" data-codesede="${assignment.Item3}">Asignar</button></td>
                                            </tr>`;
                            $('#tableNurse tbody').append(row);
                        });

                        $('.btn-asignar').on('click', function() {
                            const nurseData = {
                                id: $(this).data('id'),
                                fullName: $(this).data('fullname'),
                                codeSede: $(this).data('codesede')
                            };
                            assignNurse(nurseData);
                        });
                    },
                    error: function() {
                        showAlert("Error en la solicitud de enfermeros.", false);
                    }
                });
            }

            // ==============================
            // Función para asignar enfermero
            // ==============================
            function assignNurse(nurseData) {
                const {
                    fullName
                } = nurseData;

                const fullNameNurseInput = document.getElementById("FullNameNurse");
                const txtCodeSedesInput = document.getElementById("txtcodeSedes");


                fullNameNurseInput.value = fullName;
                fullNameNurseInput.disabled = false;
                fullNameNurseInput.classList.add("is-valid");

                const nurseFeedback = document.getElementById("nurseFeedback");
                nurseFeedback.style.display = "block";


                txtCodeSedesInput.value = nurseData.codeSede;
                txtCodeSedesInput.classList.add("is-valid");
            }

            function loadSchoolList() {
                $.ajax({
                    url: '/Assigment/GetAllSchools',
                    type: 'GET',
                    success: function(data) {
                        try {
                            data = typeof data === 'string' ? JSON.parse(data) : data;
                        } catch (e) {
                            showAlert("Error al procesar los datos de colegios.", false);
                            return;
                        }

                        if (!Array.isArray(data)) {
                            showAlert("Se esperaban datos válidos.", false);
                            return;
                        }

                        $('#tableSchool tbody').empty();
                        data.forEach(function(assignment) {
                            var row = `<tr>
                                            <td style="display:none;">${assignment.Item1}</td>
                                            <td>${assignment.Item2}</td>
                                            <td>${assignment.Item3}</td>
                                            <td>${assignment.Item4}</td>
                                            <td><button class="btn-asignarSchool" data-id="${assignment.Item1}" data-name="${assignment.Item2}" data-director="${assignment.Item4}" data-zone="${assignment.Item3}">Asignar</button></td>
                                        </tr>`;
                            $('#tableSchool tbody').append(row);
                        });


                        $('.btn-asignarSchool').on('click', function() {
                            const schoolData = {
                                id: $(this).data('id'),
                                name: $(this).data('name'),
                                director: $(this).data('director'),
                                zone: $(this).data('zone')
                            };
                            assignSchool(schoolData);
                        });
                    },
                    error: function() {
                        showAlert("Error en la solicitud de colegios.", false);
                    }
                });


                function assignSchool(schoolData) {
                    const {
                        name,
                        director,
                        zone
                    } = schoolData;


                    const nameSchoolInput = document.getElementById("nameSchool");
                    const txtInformationInput = document.getElementById("txtInformation");


                    nameSchoolInput.value = name;
                    nameSchoolInput.disabled = false;
                    nameSchoolInput.classList.add("is-valid");


                    txtInformationInput.value = `Director: ${director}, Zona: ${zone}`;
                    txtInformationInput.disabled = false;
                    txtInformationInput.classList.add("is-valid");


                    const schoolFeedback = document.getElementById("schoolFeedback");
                    schoolFeedback.style.display = "block";

                    $('#btnregistrar').on('click', function() {
                        console.log("Operación de asignación iniciada.");

                        const assignmentData = {
                            IdNurse: parseInt($('#txtidNurse').val(), 10),
                            IdSchool: parseInt($('#txtidSchool').val(), 10),
                            StartDate: $('#txtstartDate').val() + "T00:00:00",
                            EndDate: $('#txtendDate').val() + "T00:00:00",
                            StartTime: $('#txtstartTime').val() + ":00",
                            EndTime: $('#txtendTime').val() + ":00"
                        };


                        console.log("Datos de asignación:", assignmentData);

                        $.ajax({
                            url: '/Assigment/AssignNurseToSchool',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(assignmentData),
                            success: function(response) {
                                showAlert(response, true);
                                console.log("Asignación exitosa. Actualizando lista...");

                                loadAssignedList();
                                clearBtnCancel();
                            },
                            error: function(xhr) {
                                showAlert(xhr.responseText || "Error en la asignación.", false);
                            }
                        });
                    });


                    function cleanReassignment() {
                        $('#txtidNurseR').val('');
                        $('#txtidSchoolR').val('');
                        $('#txtstartDateR').val('');
                        $('#txtendDateR').val('');
                        $('#txtstartTimeR').val('');
                        $('#txtendTimeR').val('');

                        $('#zonaSelect').empty().append('<option value="Todas" disabled selected>Seleccione</option>');


                        $('#escuelaSelect').empty().append('<option value="" disabled selected>Escuelas</option>');
                    }

                    $('#btnSaveRegistreRe').on('click', function() {
                        console.log("Operación de asignación iniciada.");


                        const currentSchoolId = parseInt($('#txtCurrentSchoolIdR').val(), 10) || 0;

                        const assignmentData = {
                            IdNurse: parseInt($('#txtidNurseR').val(), 10),
                            IdSchool: parseInt($('#txtidSchoolR').val(), 10),
                            StartDate: $('#txtstartDateR').val() + "T00:00:00",
                            EndDate: $('#txtendDateR').val() + "T00:00:00",
                            StartTime: $('#txtstartTimeR').val() + ":00",
                            EndTime: $('#txtendTimeR').val() + ":00"
                        };

                        const requestData = {
                            assignment: assignmentData,
                            currentSchoolId: currentSchoolId
                        };


                        console.log("Datos de asignación:", requestData);

                        $.ajax({
                            url: '/Assigment/ReassignNurseToSchool',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(requestData),
                            success: function(response) {
                                showAlert(response, true);
                                console.log("Asignación exitosa. Actualizando lista...");


                                loadAssignedList();


                                cleanReassignment();

                                $('#ResignacionModal').modal('hide');
                            },
                            error: function(xhr) {
                                showAlert(xhr.responseText || "Error en la asignación.", false);
                            }
                        });

                    });

                    $('#ResignacionModal').on('hide.bs.modal', function() {
                        cleanReassignment()
                    });

                }



                function clearFields(selectors) {
                    selectors.forEach(function(selector) {
                        $(selector).val('');
                    });
                }

                $('#btnbuscarlector').on('click', function() {
                    clearFields(['#FullNameNurse', '#txtcodeSedes']);
                    openModalNurse();
                });


                $('#searchSchool').on('click', function() {
                    clearFields(['#nameSchool', '#txtInformation']);
                    openModalEstablecimiento();
                });


                $('#tableNurse').on('click', '.btn-asignar', function() {
                    var idNurse = $(this).data('id');
                    var nurseFullName = $(this).data('fullname');
                    var codeSede = $(this).data('codesede');

                    $('#FullNameNurse').val(nurseFullName);
                    $('#txtcodeSedes').val(codeSede);
                    $('#txtidNurse').val(idNurse);
                    checkFields(true, $('#nameSchool').val() !== '');
                    closeModal();
                });

                $('#tableSchool').on('click', '.btn-asignarSchool', function() {
                    var idSchool = $(this).data('id');
                    var schoolName = $(this).data('name');
                    var directorName = $(this).data('director');
                    var zone = $(this).data('zone');

                    $('#nameSchool').val(schoolName);
                    $('#txtInformation').val(directorName + ' (' + zone + ')');
                    $('#txtidSchool').val(idSchool);
                    checkFields($('#FullNameNurse').val() !== '', true);
                    closeModal();
                });


                $('.modal').on('click', function(e) {
                    if ($(e.target).is('.modal')) {
                        $(this).modal('hide');

                    }
                });

                $('#modalReasignar form').on('submit', function(e) {
                    e.preventDefault();
                    showAlert('Formulario enviado!', true);
                    closeModal();
                });
            });

        function loadSchoolsByZone() {
            var selectedZone = $('#zonaSelect').val();

            $.ajax({
                url: '/Assigment/GetSchoolsByZone',
                type: 'GET',
                data: {
                    zona: selectedZone
                },
                success: function(data) {
                    try {
                        data = typeof data === 'string' ? JSON.parse(data) : data;
                    } catch (e) {
                        showAlert("Error al procesar los datos de escuelas.", false);
                        return;
                    }

                    if (!Array.isArray(data)) {
                        showAlert("Se esperaban datos válidos.", false);
                        return;
                    }

                    $('#escuelaSelect').empty();
                    $('#escuelaSelect').append('<option value="" disabled selected>Escuelas</option>');

                    data.forEach(function(school) {
                        var row = `<option value="${school.Item1}">${school.Item2}</option>`;
                        $('#escuelaSelect').append(row);
                    });

                    $('#escuelaSelect').change(function() {
                        var selectedSchoolId = $(this).val();
                        $('#txtidSchoolR').val(selectedSchoolId);
                    });
                },
                error: function() {
                    showAlert("Error en la solicitud de escuelas.", false);
                }
            });
        }

        function loadNurseHistoryAssignments(idNurse, nurseName) {
            $.ajax({
                url: '/Assigment/GetNurseHistoryAssignments',
                type: 'GET',
                data: {
                    idNurse: idNurse
                },
                success: function(data) {
                    $('#NurseNameHistory').val(nurseName);
                    try {

                        if (typeof data === 'string') {
                            data = JSON.parse(data);
                        }

                        var assignments = data;
                        var tableBody = $('#nurseHistoryTable tbody');
                        tableBody.empty();

                        assignments.forEach(function(assignment) {

                            var dateOptions = {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            };


                            var startDate = new Date(assignment.Item2).toLocaleDateString('es-ES', dateOptions);
                            var endDate = new Date(assignment.Item3).toLocaleDateString('es-ES', dateOptions);

                            var startTime = assignment.Item4.slice(0, 5);
                            var endTime = assignment.Item4.slice(16, 24);

                            var row = '<tr>' +
                                '<td>' + assignment.Item1 + '</td>' +
                                '<td>' + startDate + ' - ' + endDate + '</td>' +
                                '<td>' + startTime + '  ' + endTime + '</td>' +
                                '</tr>';

                            tableBody.append(row);
                        });
                    } catch (e) {
                        console.error("Error al procesar las asignaciones:", e);
                        showAlert("Error al procesar las asignaciones.", false);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error cargando asignaciones del enfermero:', error);
                    showAlert("Error al cargar las asignaciones del enfermero.", false);
                }
            });
        }
        $(document).ready(function() {

            $('.close').on('click', function() {
                $('#HistoryModal').modal('hide');
            });
        });

        function resetInput(inputSelector, errorSelector) {
            $(inputSelector).val('');
            $(inputSelector).removeClass('is-invalid is-valid');
            $(errorSelector).hide();
        }


        function clearNurseFields() {
            resetInput('#FullNameNurse', '#nurseFeedback');
            resetInput('#txtcodeSedes', '#nurseFeedback');
        }

        function clearSchoolFields() {
            resetInput('#nameSchool', '#schoolFeedback');
            resetInput('#txtInformation', '#schoolFeedback');
        }



        function openModalNurse() {
            $("#listNurse").modal("show");
            checkFields(false, $('#nameSchool').val() !== '');
            clearNurseFields();
            $('#txtidNurse').val('');
        }

        function openModalEstablecimiento() {
            $("#listaEstablecimiento").modal("show");
            checkFields($('#FullNameNurse').val() !== '', false);
            clearSchoolFields();
            $('#txtidSchool').val('');
        }

        function clearFields() {
            resetInput('#txtstartDate', '#startDateError');
            resetInput('#txtendDate', '#endDateError');
            resetInput('#txtstartTime', '#startTimeError');
            resetInput('#txtendTime', '#endTimeError');
        }




        function checkFields(isNurseComplete, isSchoolComplete) {
            if (!(isNurseComplete && isSchoolComplete)) {
                clearFields();
            }


            $('#txtstartDate, #txtendDate, #txtstartTime, #txtendTime').prop('disabled', !(isNurseComplete && isSchoolComplete));
        }

        function showAlert(message, isSuccess) {
            var alertDiv = $('#dynamic-alert');


            if (alertDiv.length === 0) {
                $('body').append(`
                    <div id="dynamic-alert" class="alert d-flex align-items-center" role="alert" style="position: fixed; top: 0; left: 0; width: 100%; display:none; z-index: 1050; justify-content: center;">
                        <svg id="alert-icon" class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Alert:">
                            <!-- El ícono se actualizará dinámicamente -->
                        </svg>
                        <div id="alert-message" class="me-2"></div>
                    </div>
                `);
                alertDiv = $('#dynamic-alert');
            }


            alertDiv.removeClass('alert-success alert-danger');

            alertDiv.addClass(isSuccess ? 'alert-success' : 'alert-danger');


            $('#alert-message').text(message);

            var alertIcon = $('#alert-icon');
            alertIcon.html(isSuccess ?
                '<use xlink: href="#check-circle-fill" />' :
                '<use xlink: href="#exclamation-triangle-fill" />'
            );

            alertDiv.show();

            var alertInstance = new bootstrap.Alert(alertDiv.get(0));
            setTimeout(function() {
                alertInstance.close();
            }, 5000);
        }



        function openDetail(json) {
            $("#formularioContainer").show();
            $("#modalFiltro").hide();
            $("#detallesAsignacionCard").hide();

        }

        function openForm(json) {
            $("#formularioContainer").hide();
            $("#detallesAsignacionCard").show();
            $("#modalFiltro").show();

        }

        function closeModal() {
            $(".modal").modal("hide");
        }


        function clearBtnCancel() {
            clearFields();
            clearNurseFields();
            clearSchoolFields();
            $('#txtidNurse').val('');
            $('#txtidSchool').val('');

            $('#btnregistrar').prop('disabled', true);
        } 
</script>