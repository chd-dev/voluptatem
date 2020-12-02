$(document).ready(function () {

    // аттрибуты к тегам, взяты с https://jqueryvalidation.org/documentation/
    // required – Makes the element required.
    // remote – Requests a resource to check the element for validity.
    // minlength – Makes the element require a given minimum length.
    // maxlength – Makes the element require a given maximum length.
    // rangelength – Makes the element require a given value range.
    // min – Makes the element require a given minimum.
    // max – Makes the element require a given maximum.
    // range – Makes the element require a given value range.
    // step – Makes the element require a given step.
    // email – Makes the element require a valid email
    // url – Makes the element require a valid url
    // date – Makes the element require a date.
    // dateISO – Makes the element require an ISO date.
    // number – Makes the element require a decimal number.
    // digits – Makes the element require digits only.
    // equalTo – Requires the element to be the same as another one
    // описание работы атррибутов https://jqueryvalidation.org/category/methods/

    // полезные методы
    // Validator.form() – Validates the form.
    // Validator.element() – Validates a single element.
    // Validator.resetForm() – Resets the controlled form.
    // Validator.showErrors() – Show the specified messages.
    // Validator.numberOfInvalids() – Returns the number of invalid fields.

    // глобальные команды
    // jQuery.validator.addMethod() – Add a custom validation method.
    // jQuery.validator.format() – Replaces {n} placeholders with arguments.
    // jQuery.validator.setDefaults() – Modify default settings for validation.
    // jQuery.validator.addClassRules() – Add a compound class method.

    $.extend($.validator.messages, {
        required: "Поле необходимо заполнить!",
        remote: "Пожалуйста, введите правильное значение",
        email: "Пожалуйста, введите корректный адрес электронной почты",
        url: "Пожалуйста, введите корректный URL",
        date: "Пожалуйста, введите корректную дату",
        dateISO: "Пожалуйста, введите корректную дату в формате ISO",
        number: "Пожалуйста, введите число",
        digits: "Пожалуйста, вводите только цифры",
        creditcard: "Пожалуйста, введите правильный номер кредитной карты",
        equalTo: "Пожалуйста, введите такое же значение ещё раз",
        extension: "Пожалуйста, выберите файл с правильным расширением.",
        maxlength: $.validator.format("Пожалуйста, введите не больше {0} символов"),
        minlength: $.validator.format("Не менее {0} символов"),
        rangelength: $.validator.format("Пожалуйста, введите значение длиной от {0} до {1} символов"),
        range: $.validator.format("Пожалуйста, введите число от {0} до {1}"),
        max: $.validator.format("Пожалуйста, введите число, меньшее или равное {0}"),
        min: $.validator.format("Пожалуйста, введите число, большее или равное {0}")
    });

    $.validator.addMethod('realemail',
        function (value, element) {
            // return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i.test(value);
            return /.+?\@.+?/g.test(value);
        },
        'Укажите корректный адрес электронной почты'
    );
    $.validator.addMethod('phonenumber',
        function (value, element) {
            return value.replace(/\D/g, '').length === 11;
        },
        'Укажите корректный телефон'
    );
    $.validator.addMethod('realphone',
        function (value, element) {
            if (value === '') return true;

            return value.replace(/\D/g, '').length === 11;
        },
        'Укажите корректный телефон'
    );
    $.validator.addMethod('latin',
        function (value, element) {
            return !(/[а-яА-ЯЁё]/ig).test(value);
        },
        'Только латинские символы'
    );
    $.validator.addMethod('superphone',
        function (value, element) {
            var value = element.value || value || $(element).val();
            value = value.replace('+', '');

            if (value.length === value.replace(/[0-9]+/g, '').length) return false;

            if (!$(element).inputmask('isComplete')) return false;

            return true;
        },
        function (hasError, element) {
            var value = element.value || value || $(element).val();
            value = value.replace('+', '');

            if (value.length === value.replace(/[0-9]+/g, '').length) return 'Укажите телефон';

            if (!$(element).inputmask('isComplete')) return 'Номер телефона указан не полностью';

            return 'Укажите телефон';
        }
    );



    $.validator.setDefaults({
        errorClass: 'is-error',
        validClass: 'is-valid',
        rules: {
            password: {
                required: true,
                minlength: [6],
                latin: true
            },
            password_new: {
                required: true,
                minlength: [6],
                latin: true
            },
            password_retry: {
                required: true,
                equalTo: '[name=password_new]',
                latin: true
            }
        },
        messages: {
            password_retry: {
                equalTo: 'Пароли не совпадают'
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            // положим сообщение об ошибке в нужное место
            var $parent = $(element).parents('.js-parent-input-error');
            if ($parent.length > 0) {
                var $error = $parent.find('.error-message');
                if ($error.length > 0) {
                    $error.empty();
                    $error.append(error);
                }
            }
        },
        success: function ($element_with_error_message, element) {
            $element_with_error_message.addClass('is-valid');
        }
    });

    window.initValidation = function ($elements) {
        $elements.each(function (i, form) {
            // событие на кнопках отравки формы
            $(form).on('click', '.js-submit', function (e) {
                if (e) e.preventDefault();

                $(form).submit(); // пример доступа к классу валидатора $(form).data('validator')
            });

            $(form).validate({
                ignore: '.is-validate-ignore', // чтобы проверяло input type hidden
                submitHandler: function (form, event) {
                    if ($(form).valid()) {
                        // $(form).find('.js-submit').preloader('start'); // прелоадер

                        var data = $(form).serializeArray();
                        $(form).find('input[type=checkbox]').each(function () {
                            data[this.name] = this.checked;
                        });

                        // допишем к отправляемым данным data-объект
                        $.each($(form).data('data-to-send'), function (i, obj) {
                            data.push(obj);
                        });

                        // отправляем ajax
                        $.ajax({
                            method: $(form).attr('method') || 'post',
                            dataType: 'json',
                            url: $(form).data('url'),
                            data: data,
                            success: function (response) {
                                // $(form).find('.js-submit').preloader('stop'); // отключение прелоадера

                                if (response.success) {
                                    // обрабатываем ошибки
                                    if (response.hasOwnProperty('data') && response.data.formErrors) {
                                        $.each(response.data.formErrors, function (key, value) {
                                            var $input = $(form).find('[name=' + key + ']');
                                            if ($input.length > 0) {
                                                $input.addClass('is-error').removeClass('is-valid');
                                                var $parent = $input.parents('.js-parent-input-error');
                                                if ($parent.length > 0) {
                                                    var $error = $parent.find('.error-message');
                                                    if ($error.length > 0) {
                                                        $error.empty();
                                                        $error.html('<span class="is-error">' + value + '</span>');
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        // вызываем callback-функцию
                                        if ($(form).data('callback') != null && typeof $(form).data('callback') == 'function') {
                                            $(form).data('callback')(response);
                                        } else if (response.data.redirectUrl) {
                                            // иначе редиректим
                                            window.location.href = response.data.redirectUrl;
                                        } else {
                                            // иначе обновляем страницу
                                            window.location.reload();
                                        }
                                    }
                                } else {
                                    // обработка исключения
                                    alert(response.error);
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                // $(form).find('.js-submit').preloader('stop'); // отключение прелоадера

                                console.log('Error 500: ' + errorThrown);
                            }
                        });
                    }
                }
            });
        });
    };
    initValidation($('.js-validate'));
});
