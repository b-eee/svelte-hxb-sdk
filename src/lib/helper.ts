const toBase64 = (file: any) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

const clx = (...classes: string[]) => {
	return classes.filter(Boolean).join(' ');
};
export { toBase64, clx };
