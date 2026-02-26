import { ArrowButton } from 'src/ui/arrow-button';
import { Button } from 'src/ui/button';
import { Select } from 'src/ui/select';
import { RadioGroup } from 'src/ui/radio-group';
import { Separator } from 'src/ui/separator';
import { Text } from 'src/ui/text';
import {
	fontFamilyOptions,
	fontSizeOptions,
	fontColors,
	backgroundColors,
	contentWidthArr,
	defaultArticleState,
	ArticleStateType,
} from 'src/constants/articleProps';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

import styles from './ArticleParamsForm.module.scss';

export const ArticleParamsForm = () => {
	// Состояния
	const [isOpen, setIsOpen] = useState(false);
	const [currentSettings, setCurrentSettings] = useState<ArticleStateType>(defaultArticleState);
	const [draftSettings, setDraftSettings] = useState<ArticleStateType>(defaultArticleState);
	
	// Refs
	const sidebarRef = useRef<HTMLElement>(null);
	const arrowRef = useRef<HTMLDivElement>(null);

	// Функция применения настроек через CSS-переменные
	const applySettingsToCSS = (settings: ArticleStateType) => {
		const root = document.documentElement;
		
		root.style.setProperty('--font-family', settings.fontFamilyOption.value);
		root.style.setProperty('--font-size', settings.fontSizeOption.value);
		root.style.setProperty('--font-color', settings.fontColor.value);
		root.style.setProperty('--container-width', settings.contentWidth.value);
		root.style.setProperty('--bg-color', settings.backgroundColor.value);
	};

	// Применяем дефолтные настройки при монтировании
	useEffect(() => {
		applySettingsToCSS(defaultArticleState);
	}, []);

	// Обработчик клика вне сайдбара
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Если клик был по стрелке - не закрываем (стрелка сама обработает)
			if (arrowRef.current && arrowRef.current.contains(event.target as Node)) {
				return;
			}
			
			// Если клик вне сайдбара и сайдбар открыт - закрываем
			if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]); // Следим за isOpen

	// При открытии сайдбара синхронизируем черновик с текущими настройками
	useEffect(() => {
		if (isOpen) {
			setDraftSettings(currentSettings);
		}
	}, [isOpen, currentSettings]);

	// Открытие/закрытие по стрелке
	const toggleSidebar = () => {
		setIsOpen(prev => !prev);
	};

	// Обновление конкретного поля в черновике
	const updateDraftSetting = <K extends keyof ArticleStateType>(
		key: K,
		value: ArticleStateType[K]
	) => {
		setDraftSettings(prev => ({
			...prev,
			[key]: value
		}));
	};

	// Применение настроек
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentSettings(draftSettings);
		applySettingsToCSS(draftSettings);
		setIsOpen(false);
	};

	// Сброс настроек
	const handleReset = (e: React.FormEvent) => {
		e.preventDefault(); // Важно! Чтобы форма не отправлялась
		setDraftSettings(defaultArticleState);
		setCurrentSettings(defaultArticleState);
		applySettingsToCSS(defaultArticleState);
		setIsOpen(false);
	};

	return (
		<>
			{/* Стрелка для открытия/закрытия */}
			<div ref={arrowRef}>
				<ArrowButton isOpen={isOpen} onClick={toggleSidebar} />
			</div>
			
			{/* Сайдбар с формой */}
			<aside
				ref={sidebarRef}
				className={clsx(styles.container, {
					[styles.container_open]: isOpen,
				})}>
				<form className={styles.form} onSubmit={handleSubmit} onReset={handleReset}>
					<Text as='h2' size={31} weight={800} uppercase>
						Параметры статьи
					</Text>
					
					<Separator />
					
					{/* Выбор шрифта */}
					<Select
						selected={draftSettings.fontFamilyOption}
						options={fontFamilyOptions}
						onChange={(value) => updateDraftSetting('fontFamilyOption', value)}
						title='Шрифт'
					/>
					
					{/* Размер шрифта */}
					<RadioGroup
						name='fontSize'
						options={fontSizeOptions}
						selected={draftSettings.fontSizeOption}
						onChange={(value) => updateDraftSetting('fontSizeOption', value)}
						title='Размер шрифта'
					/>
					
					{/* Цвет текста */}
					<Select
						selected={draftSettings.fontColor}
						options={fontColors}
						onChange={(value) => updateDraftSetting('fontColor', value)}
						title='Цвет текста'
					/>
					
					<Separator />
					
					{/* Цвет фона */}
					<Select
						selected={draftSettings.backgroundColor}
						options={backgroundColors}
						onChange={(value) => updateDraftSetting('backgroundColor', value)}
						title='Цвет фона'
					/>
					
					{/* Ширина контента */}
					<Select
						selected={draftSettings.contentWidth}
						options={contentWidthArr}
						onChange={(value) => updateDraftSetting('contentWidth', value)}
						title='Ширина контента'
					/>
					
					<div className={styles.bottomContainer}>
						<Button title='Сбросить' htmlType='reset' type='clear' />
						<Button title='Применить' htmlType='submit' type='apply' />
					</div>
				</form>
			</aside>
		</>
	);
};